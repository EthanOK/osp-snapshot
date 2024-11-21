import snapshot from "@snapshot-labs/snapshot.js";
import { fetchRequest } from "./utils/util";

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
  private url: string;
  private apiKey: string;
  /**
   * initialize client
   * @param url
   * @param apiKey
   */
  constructor(url: string, apiKey?: string) {
    this.options = {
      url: `${url}?${apiKey ? `apiKey=${apiKey}` : ""}`
    };
    this.url = url;
    this.apiKey = apiKey;
  }

  /**
   * Get voting power
   * @param account
   * @param network
   * @param strategies
   * @param snapshot_
   * @param space
   * @returns
   */
  async getVotingPower(
    account: string,
    network: string,
    strategies: any[],
    snapshot_: number | "latest",
    space = "spaceId"
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

  /**
   * Get scores
   * @param accounts
   * @param network
   * @param strategies
   * @param snapshot_
   * @param space
   * @returns
   */
  async getScores(
    accounts: string[],
    network: string,
    strategies: any[],
    snapshot_: number | "latest",
    space = "spaceId"
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

  /**
   * Validate voting power
   * @param validationName
   * @param validationParams
   * @param strategies
   * @param account
   * @param network
   * @param snapshot_
   * @param space
   * @returns
   */
  async validate(
    validationName: string,
    validationParams: any,
    strategies: any[],
    account: string,
    network: string,
    snapshot_: number | "latest",
    space = "spaceId"
  ): Promise<boolean> {
    if (validationName == "basic") validationParams.strategies = strategies;
    return await snapshot.utils.validate(
      validationName,
      account,
      space,
      network,
      snapshot_,
      validationParams,
      this.options
    );
  }

  async getStrategies() {
    const url = `${this.url}/api/strategies?${
      this.apiKey ? `apiKey=${this.apiKey}` : ""
    }`;
    const result = await fetchRequest(url);
    return result;
  }

  async getValidations() {
    const url = `${this.url}/api/validations?${
      this.apiKey ? `apiKey=${this.apiKey}` : ""
    }`;
    const result = await fetchRequest(url);
    return result;
  }
}
