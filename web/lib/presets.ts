export const COMPARATOR_LABELS = ["GT", "GTE", "LT", "LTE"] as const;
export const COMPARATOR_SYMBOLS = ["＞", "≥", "＜", "≤"] as const;
export const MARKET_STATE_LABELS = ["Open", "Closed", "Resolving", "Resolved", "Invalid"] as const;
export const OUTCOME_LABELS = ["Unresolved", "YES", "NO"] as const;

export const DEMO_PRESET = {
  question: "Will ETH/USD be at least $4,000 when this market resolves?",
  oracleUrl: "http://localhost:3000/api/oracle/eth",
  jsonPath: ".price",
  target: "4000",
  comparator: 1, // GTE
  bettingSeconds: "180",
  resolveDelaySeconds: "60",
} as const;
