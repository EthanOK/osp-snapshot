import snapshot from "@snapshot-labs/snapshot.js";
import { fetchRequest } from "./utils/util";
import {
  SpaceStrategy,
  SpaceValidation,
  VoteValidation
} from "./utils/interfaces";

export type ProposalValidation = SpaceValidation;

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
   * Proposal validation
   * @param validation
   * @param strategies
   * @param account
   * @param network
   * @param space
   * @returns
   */
  async proposalValidate(
    validation: ProposalValidation,
    strategies: SpaceStrategy[],
    account: string,
    network: string,
    space = "spaceId"
  ): Promise<boolean> {
    if (validation.name === "basic") {
      validation.params.minScore = validation.params?.minScore || 0;
      validation.params.strategies =
        validation?.params?.strategies || strategies;
    }
    const validateRes = await snapshot.utils.validate(
      validation.name,
      account,
      space,
      network,
      "latest",
      validation.params,
      this.options
    );
    if (typeof validateRes !== "boolean") {
      console.error("Vote validation failed", validateRes);
      return false;
    }
    return validateRes;
  }

  /**
   * Vote validation
   * @param validation
   * @param strategies
   * @param account
   * @param network
   * @param snapshot_
   * @param space
   * @returns
   */
  async voteValidate(
    validation: VoteValidation,
    strategies: SpaceStrategy[],
    account: string,
    network: string,
    snapshot_: number | "latest",
    space = "spaceId"
  ): Promise<boolean> {
    const params = validation.params || {};
    if (validation.name == "basic") {
      params.strategies = params.strategies ?? strategies;
    }
    const validateRes = await snapshot.utils.validate(
      validation.name,
      account,
      space,
      network,
      snapshot_,
      validation.params,
      this.options
    );
    if (typeof validateRes !== "boolean") {
      console.error("Vote validation failed", validateRes);
      return false;
    }
    return validateRes;
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
