import { defineChain } from "viem";

export const ritualChain = defineChain({
  id: 1979,
  name: "Ritual",
  nativeCurrency: { name: "RITUAL", symbol: "RITUAL", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RPC_URL ?? "https://rpc.ritualfoundation.org"] },
  },
  blockExplorers: {
    default: { name: "Ritual Explorer", url: "https://explorer.ritualfoundation.org" },
  },
});

// Deployed RitualPredict address — from web/.env.local
export const PREDICT_ADDRESS = (process.env.NEXT_PUBLIC_PREDICT_ADDRESS ?? "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const RITUAL_WALLET = "0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948" as const;
export const SCHEDULER = "0x56e776BAE2DD60664b69Bd5F865F1180ffB7D58B" as const;
