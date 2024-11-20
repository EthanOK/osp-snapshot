import snapshot from "@snapshot-labs/snapshot.js";

export interface Strategy {
  name: string;
  network?: string;
  params: any;
}

/**
 * Score client
 */
export class ScoreClient {
  private options: { url: string };
  /**
   * initialize client
   * @param url
   * @param apiKey
   */
  constructor(url: string, apiKey?: string) {
    this.options = {
      url: `${url}?${apiKey ? `apiKey=${apiKey}` : ""}`,
    };
  }

  /**
   * Get voting power
   * @param account
   * @param network
   * @param strategies
   * @param snapshot
   * @param space
   * @returns
   */
  async getVotingPower(
    account: string,
    network: string,
    strategies: any[],
    snapshot_: number | "latest",
    space: string
  ) {
    return await snapshot.utils.getVp(
      account,
      network,
      strategies,
      snapshot_,
      space,
      false,
      this.options
    );
  }

  async getScores(
    accounts: string[],
    network: string,
    strategies: any[],
    snapshot_: number | "latest",
    space: string
  ) {
    return await snapshot.utils.getScores(
      space,
      strategies,
      network,
      accounts,
      snapshot_,
      this.options.url
    );
  }
}
