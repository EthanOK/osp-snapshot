export type BoostClaimSubgraph = {
  id: string;
  amount: string;
  transactionHash: string;
  chainId: string;
  boost: {
    id: string;
  };
};

export type BoostRewardGuard = {
  boost_id: string;
  chain_id: string;
  reward: string;
};

export type BoostVoucherGuard = {
  boost_id: string;
  chain_id: string;
  signature: string;
  reward: string;
};

export type BoostWinnersGuard = {
  winners: string[];
  prize: string;
};

/**
 * Eligibility types
 * @param type - incentive, prediction, bribe
 * @param choice - choice only bribe
 */
export type Eligibility = {
  type: "incentive" | "prediction" | "bribe";
  choice?: string;
};

/**
 * Distribution types
 * @param type - weighted or lottery
 * @param limit
 * @param numWinners
 */
export type Distribution = {
  type: "weighted" | "lottery";
  limit?: string;
  numWinners?: string;
};

export interface BoostStrategy {
  name: string;
  description: string;
  image: string;
  external_url: string;
  strategyName: string;
  params: {
    version: string;
    env: string;

    proposal: string;
    eligibility: {
      type: "incentive" | "prediction" | "bribe";
      choice?: string;
    };
    distribution: {
      type: "weighted" | "lottery";
      limit?: string;
      numWinners?: string;
    };
  };
}

export type BoostSubgraph = {
  id: string;
  strategyURI: string;
  poolSize: string;
  guard: string;
  start: string;
  end: string;
  owner: string;
  chainId: string;
  currentBalance: string;
  transaction: string;
  token: {
    id: string;
    name: string;
    symbol: string;
    decimals: string;
  };
  strategy: {
    id: string;
    version: string;
    name: string;
    proposal: string;
    eligibility: {
      type: "incentive" | "prediction" | "bribe";
      choice: string | null;
    };
    distribution: {
      type: "weighted" | "lottery";
      limit: string | null;
      numWinners: string | null;
    };
  };
};
