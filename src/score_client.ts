import snapshotjs from "@snapshot-labs/snapshot.js";

export interface Strategy {
  name: string;
  network?: string;
  params: any;
}

export class ScoreClient {
  private options: {};
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
    snapshot: number,
    space: string
  ) {
    return await snapshotjs.utils.getVp(
      account,
      network,
      strategies,
      snapshot,
      space,
      false,
      this.options
    );
  }
}
