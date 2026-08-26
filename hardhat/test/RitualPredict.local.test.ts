import assert from "node:assert/strict";
import { describe, it, before } from "node:test";
import { network } from "hardhat";

describe("RitualPredict — local lifecycle (no external chain)", async function () {
  const { viem } = await network.create({ network: "hardhatMainnet" });
  const publicClient = await viem.getPublicClient();
  let predict: any;
  let blockTimeMs = 195n;

  before(async () => {
    predict = await viem.deployContract("RitualPredict", [blockTimeMs]);
  });

  it("compiles and deploys with blockTimeMs", async () => {
    assert.equal(await predict.read.blockTimeMs(), blockTimeMs);
    assert.equal(await predict.read.marketCount(), 0n);
  });

  it("createMarket validates and books a market", async () => {
    const hash = await predict.write.createMarket([{
      question: "Will ETH be >= $4000?",
      oracleUrl: "https://api.example.com/price",
      jsonPath: ".price",
      target: 4000n,
      comparator: 1, // GTE
      bettingSeconds: 60n,
      resolveDelaySeconds: 60n,
    }]);
    await publicClient.waitForTransactionReceipt({ hash });
    assert.equal(await predict.read.marketCount(), 1n);
    const m = await predict.read.getMarket([1n]);
    assert.equal(m.question, "Will ETH be >= $4000?");
    assert.equal(m.state, 0); // Open
  });

  it("accepts YES/NO bets and tracks pools", async () => {
    const [deployer, alice, bob] = await viem.getWalletClients();
    const alicePredict = await viem.getContractAt("RitualPredict", predict.address, { client: { wallet: alice } });
    const bobPredict = await viem.getContractAt("RitualPredict", predict.address, { client: { wallet: bob } });

    // Use a fresh market with generous windows so betting stays open
    const hash = await predict.write.createMarket([{
      question: "Local market 2",
      oracleUrl: "https://api.example.com/price",
      jsonPath: ".price",
      target: 100n,
      comparator: 1,
      bettingSeconds: 300n,
      resolveDelaySeconds: 300n,
    }]);
    await publicClient.waitForTransactionReceipt({ hash });
    const id = await predict.read.marketCount(); // should be 2

    await alicePredict.write.bet([id, true], { value: 1_000_000_000_000_000n });
    await bobPredict.write.bet([id, false], { value: 2_000_000_000_000_000n });

    const m = await predict.read.getMarket([id]);
    assert.equal(m.totalYes, 1_000_000_000_000_000n);
    assert.equal(m.totalNo, 2_000_000_000_000_000n);

    const stakes = await predict.read.stakesOf([id, alice.account.address]);
    assert.equal(stakes[0], 1_000_000_000_000_000n);
  });

  it("rejects empty question and zero stake", async () => {
    await assert.rejects(
      () => predict.write.createMarket([{
        question: "", oracleUrl: "https://x", jsonPath: ".a", target: 1n, comparator: 0, bettingSeconds: 60n, resolveDelaySeconds: 60n,
      }]),
      /EmptyString|revert/
    );
    const id = 2n;
    await assert.rejects(
      () => predict.write.bet([id, true], { value: 0n }),
      /ZeroStake|revert/
    );
  });

  it("getMarkets returns newest-first", async () => {
    const all = await predict.read.getMarkets();
    assert.equal(all.length, 2);
    assert.equal(all[0].id, 2n);
  });
});
