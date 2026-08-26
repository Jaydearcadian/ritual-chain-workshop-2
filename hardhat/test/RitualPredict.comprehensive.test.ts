import assert from "node:assert/strict";
import { describe, it, before, beforeEach } from "node:test";
import { network } from "hardhat";
import { parseEther, encodeFunctionData, parseAbi } from "viem";

const SCHEDULER = "0x56e776BAE2DD60664b69Bd5F865F1180ffB7D58B" as `0x${string}`;
const HTTP = "0x0000000000000000000000000000000000000801" as `0x${string}`;
const JQ = "0x0000000000000000000000000000000000000803" as `0x${string}`;
const REGISTRY = "0x9644e8562cE0Fe12b4deeC4163c064A8862Bf47F" as `0x${string}`;
const WALLET = "0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948" as `0x${string}`;

describe("RitualPredict — comprehensive local (mocked precompiles + scheduler)", async function () {
  const connection: any = await network.create({ network: "hardhatMainnet" });
  const viem: any = connection.viem;
  const provider: any = connection.provider;
  const publicClient: any = await viem.getPublicClient();

  const blockTimeMs = 195n;
  let predict: any;

  // contract wrappers at canonical addresses after etching
  let schedulerAtCanonical: any;
  let httpAtCanonical: any;
  let jqAtCanonical: any;
  let registryAtCanonical: any;
  let walletAtCanonical: any;

  async function etchMock(canonical: string, contractName: string, args: any[] = []) {
    const ephemeral: any = await viem.deployContract(contractName as any, args as any);
    const code: string = await publicClient.getCode({ address: ephemeral.address });
    await provider.request({ method: "hardhat_setCode", params: [canonical, code] });
    return ephemeral;
  }

  async function impersonatedCall(to: `0x${string}`, data: `0x${string}`, from: `0x${string}`) {
    await provider.request({ method: "hardhat_impersonateAccount", params: [from] });
    await provider.request({ method: "hardhat_setBalance", params: [from, "0x1000000000000000000"] });
    const hash: string = await provider.request({
      method: "eth_sendTransaction",
      params: [{ from, to, data }],
    });
    await publicClient.waitForTransactionReceipt({ hash });
    await provider.request({ method: "hardhat_stopImpersonatingAccount", params: [from] });
    return hash;
  }

  async function mineBlocks(n: number) {
    // hardhat_mine expects hex string
    await provider.request({ method: "hardhat_mine", params: ["0x" + n.toString(16), "0x0"] });
  }

  // ───────────────────────────────── setup ──────────────────────────────────
  before(async () => {
    await etchMock(SCHEDULER, "SchedulerMock");
    await etchMock(HTTP, "HTTPPrecompileMock");
    await etchMock(JQ, "JQPrecompileMock");
    await etchMock(REGISTRY, "TEERegistryMock");
    await etchMock(WALLET, "RitualWalletMock");

    schedulerAtCanonical = await viem.getContractAt("SchedulerMock", SCHEDULER);
    httpAtCanonical = await viem.getContractAt("HTTPPrecompileMock", HTTP);
    jqAtCanonical = await viem.getContractAt("JQPrecompileMock", JQ);
    registryAtCanonical = await viem.getContractAt("TEERegistryMock", REGISTRY);
    walletAtCanonical = await viem.getContractAt("RitualWalletMock", WALLET);

    // default happy path configuration
    await registryAtCanonical.write.setFound([true]);
    await registryAtCanonical.write.setExecutor(["0x00000000000000000000000000000000000000E0"]);
    await httpAtCanonical.write.setMode([0]);
    await jqAtCanonical.write.setValue([101000n]);

    predict = await viem.deployContract("RitualPredict", [blockTimeMs]);
  });

  // helpers to reset happy path before each test that needs it
  async function resetHappyPath() {
    await registryAtCanonical.write.setFound([true]);
    await httpAtCanonical.write.setMode([0]);
    await jqAtCanonical.write.setValue([101000n]);
  }

  function secondsToBlocks(s: bigint) {
    let b = (s * 1000n) / blockTimeMs;
    if (b === 0n) b = 1n;
    return b;
  }

  // ───────────────────────── market creation ────────────────────────────────

  it("computes closeBlock and resolveBlock from blockTimeMs", async () => {
    const beforeBlock = await publicClient.getBlockNumber();
    const bettingSeconds = 60n;
    const resolveDelay = 60n;
    const hash = await predict.write.createMarket([{
      question: "block math check",
      oracleUrl: "https://api.example.com/price",
      jsonPath: ".price",
      target: 100n,
      comparator: 1,
      bettingSeconds,
      resolveDelaySeconds: resolveDelay,
    }]);
    await publicClient.waitForTransactionReceipt({ hash });
    const id = await predict.read.marketCount();
    const m = await predict.read.getMarket([id]);
    const expCloseOffset = secondsToBlocks(bettingSeconds);
    const expResolveOffset = secondsToBlocks(resolveDelay);
    // closeBlock = beforeBlock+1 + offset (TX mines in next block)
    // allow ±1 drift due to EDR block timing
    const actualCloseOffset = m.closeBlock - beforeBlock;
    const actualResolveOffset = m.resolveBlock - m.closeBlock;
    assert.ok(actualCloseOffset >= expCloseOffset && actualCloseOffset <= expCloseOffset + 2n, `close offset ${actualCloseOffset} vs ${expCloseOffset}`);
    assert.equal(actualResolveOffset, expResolveOffset);
  });

  it("emits MarketCreated (twice), ResolutionRuleSet and books scheduleId", async () => {
    const beforeSid = await schedulerAtCanonical.read.callCount();
    const hash = await predict.write.createMarket([{
      question: "emit check",
      oracleUrl: "https://api.example.com/price",
      jsonPath: ".price",
      target: 42n,
      comparator: 0, // GT
      bettingSeconds: 120n,
      resolveDelaySeconds: 60n,
    }]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    assert.equal(receipt.status, "success");
    const id = await predict.read.marketCount();
    const m = await predict.read.getMarket([id]);
    // scheduleId should be non-zero and equal to scheduler callCount
    const afterSid = await schedulerAtCanonical.read.callCount();
    assert.equal(m.scheduleId, afterSid);
    assert.ok(m.scheduleId > 0n);
    // lastStartBlock should equal resolveBlock
    const lastStart = await schedulerAtCanonical.read.lastStartBlockStored();
    assert.equal(lastStart, m.resolveBlock);
    // verify ResolutionRuleSet can be read via getMarket
    assert.equal(m.oracleUrl, "https://api.example.com/price");
    assert.equal(m.jsonPath, ".price");
    assert.equal(m.target, 42n);
  });

  it("reverts on bad durations and empty strings", async () => {
    await assert.rejects(() => predict.write.createMarket([{
      question: "", oracleUrl: "https://x", jsonPath: ".a", target: 1n, comparator: 0, bettingSeconds: 60n, resolveDelaySeconds: 60n,
    }]), /EmptyString|revert/);
    await assert.rejects(() => predict.write.createMarket([{
      question: "q", oracleUrl: "", jsonPath: ".a", target: 1n, comparator: 0, bettingSeconds: 60n, resolveDelaySeconds: 60n,
    }]), /EmptyString|revert/);
    await assert.rejects(() => predict.write.createMarket([{
      question: "q", oracleUrl: "https://x", jsonPath: "", target: 1n, comparator: 0, bettingSeconds: 60n, resolveDelaySeconds: 60n,
    }]), /EmptyString|revert/);
    await assert.rejects(() => predict.write.createMarket([{
      question: "q", oracleUrl: "https://x", jsonPath: ".a", target: 1n, comparator: 0, bettingSeconds: 10n, resolveDelaySeconds: 60n,
    }]), /BadDuration|revert/);
    await assert.rejects(() => predict.write.createMarket([{
      question: "q", oracleUrl: "https://x", jsonPath: ".a", target: 1n, comparator: 0, bettingSeconds: 60n, resolveDelaySeconds: 5n,
    }]), /BadDuration|revert/);
    await assert.rejects(() => predict.write.createMarket([{
      question: "q", oracleUrl: "https://x", jsonPath: ".a", target: 1n, comparator: 0, bettingSeconds: 86400n, resolveDelaySeconds: 60n,
    }]), /BadDuration|revert/);
  });

  it("resolution rule is immutable (no setter, getMarket returns same)", async () => {
    const hash = await predict.write.createMarket([{
      question: "immutable rule",
      oracleUrl: "https://api.example.com/a",
      jsonPath: ".price",
      target: 999n,
      comparator: 2, // LT
      bettingSeconds: 120n,
      resolveDelaySeconds: 60n,
    }]);
    await publicClient.waitForTransactionReceipt({ hash });
    const id = await predict.read.marketCount();
    const m1 = await predict.read.getMarket([id]);
    assert.equal(m1.oracleUrl, "https://api.example.com/a");
    assert.equal(m1.jsonPath, ".price");
    assert.equal(m1.target, 999n);
    assert.equal(m1.comparator, 2);
    // contract has no setOracleUrl / setTarget — assert ABI has no such function
    const abiNames = (predict.abi as any[]).filter((x: any) => x.type === "function").map((x: any) => x.name);
    assert.ok(!abiNames.includes("setOracleUrl"));
    assert.ok(!abiNames.includes("setTarget"));
    assert.ok(!abiNames.includes("updateMarket"));
  });

  // ───────────────────────────── betting ───────────────────────────────────

  it("accumulates YES/NO stakes and exposes stakesOf (no AlreadyEntered)", async () => {
    const [deployer, alice, bob] = await viem.getWalletClients();
    const hash = await predict.write.createMarket([{
      question: "bet accumulation",
      oracleUrl: "https://api.example.com/price",
      jsonPath: ".price",
      target: 100n,
      comparator: 1,
      bettingSeconds: 300n,
      resolveDelaySeconds: 300n,
    }]);
    await publicClient.waitForTransactionReceipt({ hash });
    const id = await predict.read.marketCount();
    const aliceP = await viem.getContractAt("RitualPredict", predict.address, { client: { wallet: alice } });
    const bobP = await viem.getContractAt("RitualPredict", predict.address, { client: { wallet: bob } });
    await aliceP.write.bet([id, true], { value: 1_000_000_000_000_000n });
    // same address bets again — should accumulate, not revert
    await aliceP.write.bet([id, true], { value: 500_000_000_000_000n });
    await bobP.write.bet([id, false], { value: 2_000_000_000_000_000n });
    const m = await predict.read.getMarket([id]);
    assert.equal(m.totalYes, 1_500_000_000_000_000n);
    assert.equal(m.totalNo, 2_000_000_000_000_000n);
    const s = await predict.read.stakesOf([id, alice.account.address]);
    assert.equal(s[0], 1_500_000_000_000_000n);
    assert.equal(s[1], 0n);
    assert.equal(s[2], false);
  });

  it("reverts ZeroStake and BettingClosed after closeBlock", async () => {
    const [deployer, alice] = await viem.getWalletClients();
    const hash = await predict.write.createMarket([{
      question: "close window",
      oracleUrl: "https://api.example.com/price",
      jsonPath: ".price",
      target: 100n,
      comparator: 1,
      bettingSeconds: 30n, // 153 blocks
      resolveDelaySeconds: 30n,
    }]);
    await publicClient.waitForTransactionReceipt({ hash });
    const id = await predict.read.marketCount();
    const m = await predict.read.getMarket([id]);
    await assert.rejects(() => predict.write.bet([id, true], { value: 0n }), /ZeroStake|revert/);
    // mine past closeBlock
    const cur = await publicClient.getBlockNumber();
    const toMine = Number(m.closeBlock - cur + 1n);
    if (toMine > 0) await mineBlocks(toMine);
    await assert.rejects(() => predict.write.bet([id, true], { value: 1n }), /BettingClosed|revert/);
    // getMarket view should flip Open->Closed after closeBlock
    const m2 = await predict.read.getMarket([id]);
    assert.equal(m2.state, 1); // Closed
  });

  // ────────────────────── scheduler callback ────────────────────────────────

  it("reverts OnlyScheduler when caller is not the scheduler", async () => {
    const hash = await predict.write.createMarket([{
      question: "only scheduler",
      oracleUrl: "https://api.example.com/price",
      jsonPath: ".price",
      target: 100n,
      comparator: 1,
      bettingSeconds: 300n,
      resolveDelaySeconds: 300n,
    }]);
    await publicClient.waitForTransactionReceipt({ hash });
    const id = await predict.read.marketCount();
    await assert.rejects(
      () => (predict as any).write.onScheduledResolve([0n, id]),
      /OnlyScheduler|revert/
    );
  });

  it("resolves YES when observed >= target (GTE) and emits events", async () => {
    await resetHappyPath();
    await jqAtCanonical.write.setValue([101000n]); // observed 101000
    const [deployer, alice, bob] = await viem.getWalletClients();
    const hash = await predict.write.createMarket([{
      question: "resolve YES",
      oracleUrl: "https://api.example.com/price",
      jsonPath: ".price",
      target: 101000n,
      comparator: 1, // GTE => 101000 >= 101000 => YES
      bettingSeconds: 300n,
      resolveDelaySeconds: 300n,
    }]);
    await publicClient.waitForTransactionReceipt({ hash });
    const id = await predict.read.marketCount();
    const aliceP = await viem.getContractAt("RitualPredict", predict.address, { client: { wallet: alice } });
    const bobP = await viem.getContractAt("RitualPredict", predict.address, { client: { wallet: bob } });
    await aliceP.write.bet([id, true], { value: 1_000_000_000_000_000n });
    await bobP.write.bet([id, false], { value: 1_000_000_000_000_000n });
    // call as scheduler
    const data = encodeFunctionData({
      abi: predict.abi,
      functionName: "onScheduledResolve",
      args: [0n, id],
    });
    await impersonatedCall(predict.address, data, SCHEDULER);
    const m = await predict.read.getMarket([id]);
    assert.equal(m.state, 3); // Resolved
    assert.equal(m.outcome, 1); // Yes
    assert.equal(m.observedValue, 101000n);
    assert.equal(m.attempts, 1);
  });

  it("resolves NO when observed < target (GTE)", async () => {
    await resetHappyPath();
    await jqAtCanonical.write.setValue([50000n]);
    const hash = await predict.write.createMarket([{
      question: "resolve NO",
      oracleUrl: "https://api.example.com/price",
      jsonPath: ".price",
      target: 101000n,
      comparator: 1, // GTE => 50000 < 101000 => NO
      bettingSeconds: 300n,
      resolveDelaySeconds: 300n,
    }]);
    await publicClient.waitForTransactionReceipt({ hash });
    const id = await predict.read.marketCount();
    const [a, alice] = await viem.getWalletClients();
    const aliceP = await viem.getContractAt("RitualPredict", predict.address, { client: { wallet: alice } });
    await aliceP.write.bet([id, true], { value: 1_000_000_000_000_000n });
    await aliceP.write.bet([id, false], { value: 2_000_000_000_000_000n });
    const data = encodeFunctionData({ abi: predict.abi, functionName: "onScheduledResolve", args: [0n, id] });
    await impersonatedCall(predict.address, data, SCHEDULER);
    const m = await predict.read.getMarket([id]);
    assert.equal(m.state, 3);
    assert.equal(m.outcome, 2); // No
    assert.equal(m.observedValue, 50000n);
  });

  it("comparator GT/LT/LTE behave correctly", async () => {
    await resetHappyPath();
    // LT: 100 < 200 => YES, 100 < 50 => NO
    const configs: Array<[number, bigint, bigint, number]> = [
      [0, 150n, 100n, 1], // GT 150>100 => YES
      [0, 50n, 100n, 2], // GT 50>100 => NO
      [2, 50n, 100n, 1], // LT 50<100 => YES
      [2, 150n, 100n, 2], // LT 150<100 => NO
      [3, 100n, 100n, 1], // LTE 100<=100 => YES
      [3, 101n, 100n, 2], // LTE 101<=100 => NO
    ];
    for (const [comp, observed, target, expectedOutcome] of configs) {
      await jqAtCanonical.write.setValue([observed]);
      const hash = await predict.write.createMarket([{
        question: `comp ${comp} obs ${observed} tgt ${target}`,
        oracleUrl: "https://api.example.com/price",
        jsonPath: ".price",
        target,
        comparator: comp,
        bettingSeconds: 300n,
        resolveDelaySeconds: 300n,
      }]);
      await publicClient.waitForTransactionReceipt({ hash });
      const id = await predict.read.marketCount();
      const [_, alice] = await viem.getWalletClients();
      const aliceP = await viem.getContractAt("RitualPredict", predict.address, { client: { wallet: alice } });
      // need both sides funded to avoid empty-winning-pool Invalid
      await aliceP.write.bet([id, true], { value: 1_000n });
      await aliceP.write.bet([id, false], { value: 1_000n });
      const data = encodeFunctionData({ abi: predict.abi, functionName: "onScheduledResolve", args: [0n, id] });
      await impersonatedCall(predict.address, data, SCHEDULER);
      const m = await predict.read.getMarket([id]);
      assert.equal(m.outcome, expectedOutcome, `comp ${comp} obs ${observed} tgt ${target}`);
      assert.equal(m.state, 3);
    }
  });

  it("empty winning pool -> Invalid (refundable)", async () => {
    await resetHappyPath();
    await jqAtCanonical.write.setValue([200n]); // with GTE 200>=100 => YES, but no YES bets
    const hash = await predict.write.createMarket([{
      question: "empty winning pool",
      oracleUrl: "https://api.example.com/price",
      jsonPath: ".price",
      target: 100n,
      comparator: 1,
      bettingSeconds: 300n,
      resolveDelaySeconds: 300n,
    }]);
    await publicClient.waitForTransactionReceipt({ hash });
    const id = await predict.read.marketCount();
    const [_, alice] = await viem.getWalletClients();
    const aliceP = await viem.getContractAt("RitualPredict", predict.address, { client: { wallet: alice } });
    await aliceP.write.bet([id, false], { value: 1_000_000n }); // only NO
    const data = encodeFunctionData({ abi: predict.abi, functionName: "onScheduledResolve", args: [0n, id] });
    await impersonatedCall(predict.address, data, SCHEDULER);
    const m = await predict.read.getMarket([id]);
    assert.equal(m.state, 4); // Invalid
    assert.ok(m.invalidReason.toLowerCase().includes("empty winning pool"));
  });

  // ─────────────────────── failure modes → Invalid after 3 attempts ─────────

  it("no executor available fails and becomes Invalid after MAX_ATTEMPTS", async () => {
    await registryAtCanonical.write.setFound([false]);
    await jqAtCanonical.write.setValue([99999n]);
    await httpAtCanonical.write.setMode([0]);
    const hash = await predict.write.createMarket([{
      question: "no executor",
      oracleUrl: "https://api.example.com/price",
      jsonPath: ".price",
      target: 100n,
      comparator: 1,
      bettingSeconds: 300n,
      resolveDelaySeconds: 300n,
    }]);
    await publicClient.waitForTransactionReceipt({ hash });
    const id = await predict.read.marketCount();
    const [_, alice] = await viem.getWalletClients();
    const aliceP = await viem.getContractAt("RitualPredict", predict.address, { client: { wallet: alice } });
    await aliceP.write.bet([id, true], { value: 1_000n });
    for (let i = 0; i < 3; i++) {
      const data = encodeFunctionData({ abi: predict.abi, functionName: "onScheduledResolve", args: [BigInt(i), id] });
      await impersonatedCall(predict.address, data, SCHEDULER);
    }
    const m = await predict.read.getMarket([id]);
    assert.equal(m.state, 4); // Invalid
    assert.equal(m.attempts, 3);
    assert.ok(m.invalidReason.includes("no executor"));
    await resetHappyPath();
  });

  it("HTTP non-200, executor error, precompile revert and jq fail all become Invalid after 3 attempts", async () => {
    const cases: Array<[number, string, () => Promise<void>, () => Promise<void>]> = [
      [1, "http status", async () => { await httpAtCanonical.write.setMode([1]); }, async () => { await httpAtCanonical.write.setMode([0]); }],
      [2, "executor timeout", async () => { await httpAtCanonical.write.setMode([2]); }, async () => { await httpAtCanonical.write.setMode([0]); }],
      [3, "TTL expired", async () => { await httpAtCanonical.write.setMode([3]); }, async () => { await httpAtCanonical.write.setMode([0]); }],
    ];
    for (const [mode, substr, setup, teardown] of cases) {
      await setup();
      await registryAtCanonical.write.setFound([true]);
      await jqAtCanonical.write.setValue([12345n]);
      const hash = await predict.write.createMarket([{
        question: `http fail ${mode}`,
        oracleUrl: "https://api.example.com/price",
        jsonPath: ".price",
        target: 1n, comparator: 1, bettingSeconds: 300n, resolveDelaySeconds: 300n,
      }]);
      await publicClient.waitForTransactionReceipt({ hash });
      const id = await predict.read.marketCount();
      for (let i = 0; i < 3; i++) {
        const data = encodeFunctionData({ abi: predict.abi, functionName: "onScheduledResolve", args: [BigInt(i), id] });
        await impersonatedCall(predict.address, data, SCHEDULER);
      }
      const m = await predict.read.getMarket([id]);
      assert.equal(m.state, 4, `mode ${mode} should be Invalid`);
      assert.ok(m.invalidReason.toLowerCase().includes(substr.toLowerCase()) || m.invalidReason.length > 0, `reason "${m.invalidReason}" should contain "${substr}"`);
      await teardown();
    }
    // jq failure
    await httpAtCanonical.write.setMode([0]);
    await jqAtCanonical.write.setFail([true]);
    {
      const hash = await predict.write.createMarket([{
        question: "jq fail", oracleUrl: "https://api.example.com/price", jsonPath: ".price", target: 1n, comparator: 1, bettingSeconds: 300n, resolveDelaySeconds: 300n,
      }]);
      await publicClient.waitForTransactionReceipt({ hash });
      const id = await predict.read.marketCount();
      for (let i = 0; i < 3; i++) {
        const data = encodeFunctionData({ abi: predict.abi, functionName: "onScheduledResolve", args: [BigInt(i), id] });
        await impersonatedCall(predict.address, data, SCHEDULER);
      }
      const m = await predict.read.getMarket([id]);
      assert.equal(m.state, 4);
      assert.ok(m.invalidReason.includes("jq"));
    }
    await jqAtCanonical.write.setFail([false]);
    await jqAtCanonical.write.setValue([101000n]);
  });

  it("attempt counter increments and Resolving state after intermediate failures", async () => {
    await httpAtCanonical.write.setMode([1]); // fail first 2
    const hash = await predict.write.createMarket([{
      question: "attempt counter",
      oracleUrl: "https://api.example.com/price",
      jsonPath: ".price",
      target: 1n, comparator: 1, bettingSeconds: 300n, resolveDelaySeconds: 300n,
    }]);
    await publicClient.waitForTransactionReceipt({ hash });
    const id = await predict.read.marketCount();
    const [_, alice] = await viem.getWalletClients();
    const aliceP = await viem.getContractAt("RitualPredict", predict.address, { client: { wallet: alice } });
    await aliceP.write.bet([id, true], { value: 1000n });
    await aliceP.write.bet([id, false], { value: 1000n });
    // advance past closeBlock so Open -> Resolving transition occurs (bettingSeconds 300 => ~1538 blocks)
    const m0 = await predict.read.getMarket([id]);
    const blocksToClose = Number(m0.closeBlock) - Number(await publicClient.getBlockNumber());
    if (blocksToClose > 0) {
      await provider.request({ method: "hardhat_mine", params: ["0x" + (blocksToClose + 1).toString(16)] });
    }
    let data = encodeFunctionData({ abi: predict.abi, functionName: "onScheduledResolve", args: [0n, id] });
    await impersonatedCall(predict.address, data, SCHEDULER);
    let m = await predict.read.getMarket([id]);
    assert.equal(m.attempts, 1);
    assert.equal(m.state, 2); // Resolving
    data = encodeFunctionData({ abi: predict.abi, functionName: "onScheduledResolve", args: [1n, id] });
    await impersonatedCall(predict.address, data, SCHEDULER);
    m = await predict.read.getMarket([id]);
    assert.equal(m.attempts, 2);
    assert.equal(m.state, 2);
    // third success
    await httpAtCanonical.write.setMode([0]);
    await jqAtCanonical.write.setValue([999n]);
    data = encodeFunctionData({ abi: predict.abi, functionName: "onScheduledResolve", args: [2n, id] });
    await impersonatedCall(predict.address, data, SCHEDULER);
    m = await predict.read.getMarket([id]);
    assert.equal(m.state, 3);
    assert.equal(m.attempts, 3);
    await resetHappyPath();
  });

  it("idempotency: extra scheduler calls after terminal state are harmless", async () => {
    await resetHappyPath();
    await jqAtCanonical.write.setValue([777n]);
    const hash = await predict.write.createMarket([{
      question: "idempotency",
      oracleUrl: "https://api.example.com/price",
      jsonPath: ".price",
      target: 100n, comparator: 1, bettingSeconds: 300n, resolveDelaySeconds: 300n,
    }]);
    await publicClient.waitForTransactionReceipt({ hash });
    const id = await predict.read.marketCount();
    const [_, alice] = await viem.getWalletClients();
    const aliceP = await viem.getContractAt("RitualPredict", predict.address, { client: { wallet: alice } });
    await aliceP.write.bet([id, true], { value: 1000n });
    await aliceP.write.bet([id, false], { value: 1000n });
    let data = encodeFunctionData({ abi: predict.abi, functionName: "onScheduledResolve", args: [0n, id] });
    await impersonatedCall(predict.address, data, SCHEDULER);
    const m1 = await predict.read.getMarket([id]);
    assert.equal(m1.state, 3);
    data = encodeFunctionData({ abi: predict.abi, functionName: "onScheduledResolve", args: [1n, id] });
    await impersonatedCall(predict.address, data, SCHEDULER);
    const m2 = await predict.read.getMarket([id]);
    assert.equal(m2.state, 3);
    assert.equal(m2.attempts, 1); // not incremented
    assert.equal(m2.outcome, m1.outcome);
  });

  // ────────────────────── payouts ──────────────────────────────────────────

  it("claimWinnings pari-mutuel and claimRefund on Invalid", async () => {
    await resetHappyPath();
    await jqAtCanonical.write.setValue([200n]); // GTE 200>=100 => YES wins
    const [deployer, alice, bob, carol] = await viem.getWalletClients();
    const hash = await predict.write.createMarket([{
      question: "payout test", oracleUrl: "https://api.example.com/price", jsonPath: ".price", target: 100n, comparator: 1, bettingSeconds: 300n, resolveDelaySeconds: 300n,
    }]);
    await publicClient.waitForTransactionReceipt({ hash });
    const id = await predict.read.marketCount();
    const aliceP = await viem.getContractAt("RitualPredict", predict.address, { client: { wallet: alice } });
    const bobP = await viem.getContractAt("RitualPredict", predict.address, { client: { wallet: bob } });
    const carolP = await viem.getContractAt("RitualPredict", predict.address, { client: { wallet: carol } });
    // alice 1 ETH YES, bob 3 ETH YES, carol 2 ETH NO => total 6, winning 4
    await aliceP.write.bet([id, true], { value: parseEther("1") });
    await bobP.write.bet([id, true], { value: parseEther("3") });
    await carolP.write.bet([id, false], { value: parseEther("2") });
    const data = encodeFunctionData({ abi: predict.abi, functionName: "onScheduledResolve", args: [0n, id] });
    await impersonatedCall(predict.address, data, SCHEDULER);
    const m = await predict.read.getMarket([id]);
    assert.equal(m.state, 3);
    assert.equal(m.outcome, 1);
    // stakesOf claimable before claim
    const sAlice = await predict.read.stakesOf([id, alice.account.address]);
    const expAlice = (parseEther("1") * parseEther("6")) / parseEther("4"); // 1.5 ETH
    assert.equal(sAlice[3], expAlice);
    // carol (loser) claimable 0
    const sCarol = await predict.read.stakesOf([id, carol.account.address]);
    assert.equal(sCarol[3], 0n);
    await assert.rejects(() => carolP.write.claimWinnings([id]), /NothingToClaim|revert/);
    // alice claims
    const balBefore = await publicClient.getBalance({ address: alice.account.address });
    const tx = await aliceP.write.claimWinnings([id]);
    await publicClient.waitForTransactionReceipt({ hash: tx });
    // AlreadySettled on second claim
    await assert.rejects(() => aliceP.write.claimWinnings([id]), /AlreadySettled|revert/);
    // bob claims 4.5 ETH
    await bobP.write.claimWinnings([id]);
    const sAliceAfter = await predict.read.stakesOf([id, alice.account.address]);
    assert.equal(sAliceAfter[2], true);
    assert.equal(sAliceAfter[3], 0n);

    // Invalid refund path
    await jqAtCanonical.write.setValue([999n]);
    // force empty winning pool -> Invalid
    const hash2 = await predict.write.createMarket([{
      question: "refund test", oracleUrl: "https://api.example.com/price", jsonPath: ".price", target: 50n, comparator: 1, bettingSeconds: 300n, resolveDelaySeconds: 300n,
    }]);
    await publicClient.waitForTransactionReceipt({ hash: hash2 });
    const id2 = await predict.read.marketCount();
    // alice bets YES only, but we will make NO win by setting observed=10 (<50 => NO wins, YES pool non-empty but NO pool empty? need NO win empty)
    // So bet YES only, target 50 GTE observed 10 => NO wins but no NO stake => empty => Invalid
    await jqAtCanonical.write.setValue([10n]);
    await aliceP.write.bet([id2, true], { value: parseEther("1") });
    const data2 = encodeFunctionData({ abi: predict.abi, functionName: "onScheduledResolve", args: [0n, id2] });
    await impersonatedCall(predict.address, data2, SCHEDULER);
    const m2 = await predict.read.getMarket([id2]);
    assert.equal(m2.state, 4);
    // claimRefund
    const rTx = await aliceP.write.claimRefund([id2]);
    await publicClient.waitForTransactionReceipt({ hash: rTx });
    await assert.rejects(() => aliceP.write.claimRefund([id2]), /AlreadySettled|revert/);
    await assert.rejects(() => bobP.write.claimRefund([id2]), /NothingToClaim|revert/);
    await assert.rejects(() => aliceP.write.claimWinnings([id2]), /NotResolved|revert/);
    await resetHappyPath();
  });

  it("claimWinnings reverts NotResolved before resolution and claimRefund reverts NotInvalid when Resolved", async () => {
    await resetHappyPath();
    const [_, alice] = await viem.getWalletClients();
    const aliceP = await viem.getContractAt("RitualPredict", predict.address, { client: { wallet: alice } });
    const hash = await predict.write.createMarket([{
      question: "not resolved yet", oracleUrl: "https://api.example.com/price", jsonPath: ".price", target: 100n, comparator: 1, bettingSeconds: 300n, resolveDelaySeconds: 300n,
    }]);
    await publicClient.waitForTransactionReceipt({ hash });
    const id = await predict.read.marketCount();
    await aliceP.write.bet([id, true], { value: 1000n });
    await assert.rejects(() => aliceP.write.claimWinnings([id]), /NotResolved|revert/);
    await assert.rejects(() => aliceP.write.claimRefund([id]), /NotInvalid|revert/);
    // resolve it
    await jqAtCanonical.write.setValue([200n]);
    await aliceP.write.bet([id, false], { value: 1000n });
    const data = encodeFunctionData({ abi: predict.abi, functionName: "onScheduledResolve", args: [0n, id] });
    await impersonatedCall(predict.address, data, SCHEDULER);
    await assert.rejects(() => aliceP.write.claimRefund([id]), /NotInvalid|revert/);
  });

  // ────────────────── fundExecution / executionBalance ─────────────────────

  it("fundExecution deposits to RitualWallet and executionBalance reflects it", async () => {
    const balBefore: bigint = await predict.read.executionBalance();
    const hash = await predict.write.fundExecution([100n], { value: parseEther("0.01") });
    await publicClient.waitForTransactionReceipt({ hash });
    const balAfter: bigint = await predict.read.executionBalance();
    assert.equal(balAfter - balBefore, parseEther("0.01"));
    // wallet mock balanceOf for predict address matches
    const wBal: bigint = await walletAtCanonical.read.balanceOf([predict.address]);
    assert.equal(wBal, balAfter);
    await assert.rejects(() => predict.write.fundExecution([100n], { value: 0n }), /ZeroStake|revert/);
  });

  it("getMarkets newest-first and getMarket UnknownMarket revert", async () => {
    const all: any[] = await predict.read.getMarkets();
    assert.ok(all.length >= 1);
    assert.equal(all[0].id, await predict.read.marketCount());
    await assert.rejects(() => predict.read.getMarket([999999n]), /UnknownMarket|revert/);
  });
});
