import snapshot from "@snapshot-labs/snapshot.js";
import { Web3Provider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import {
  Proposal,
  ProposalType,
  Vote
} from "@snapshot-labs/snapshot.js/src/sign/types";
import Client from "@snapshot-labs/snapshot.js/dist/src/sign";
import { fetchRequest } from "./utils/util";

/**
 * Follow type
 */
export enum FollowType {
  FOLLOW = "follow",
  UNFOLLOW = "unfollow"
}

/**
 * Sign response result
 * @param id string
 * @param ipfs string
 * @param relayer { address: string; receipt: string }
 */
export interface Message {
  id: string;
  ipfs: string;
}

/**
 * Sign Response Data
 * @param code number
 * @param data
 * @param error string
 */
export interface ResponseData {
  code: number;
  data?: Message;
  error?: string;
}

export enum ChoiceType {
  SINGLE = "single-choice",
  MULTIPLE = "approval"
}

export interface CreateProposalPrams {
  space: string;
  type: ProposalType;
  title: string;
  choices: string[];
  start: number;
  end: number;
  snapshot: number;
}

export interface CreateVotePrams {
  space: string;
  proposal: string;
  type: ProposalType;
  choice: number | number[] | string | { [key: string]: number };
}

/**
 * Flag operation params
 * @param type "space" | "proposal"
 * @param action "flag" | "unflag" | "verify" | "hibernate" | "reactivate"
 * @param value id
 */
export interface FlagOperationParams {
  type: "space" | "proposal";
  action: "flag" | "unflag" | "verify" | "hibernate" | "reactivate";
  value: string;
}

/**
 * Sign client
 */
export class SnapShotSignClient {
  private signClient: Client;
  private sequencerUrl: string;
  private apiKey: string;

  /**
   * Initialize the client
   * @param sequencerUrl
   * @param apiKey
   */
  constructor(sequencerUrl: string, apiKey?: string) {
    this.signClient = new snapshot.Client712(
      `${sequencerUrl}?${apiKey ? `apiKey=${apiKey}` : ""}`
    );
    this.sequencerUrl = sequencerUrl;
    this.apiKey = apiKey;
  }

  /**
   * Sign create or update space
   * @param web3
   * @param address
   * @param spaceId
   * @param settings
   * @returns
   */
  async signCreateOrUpdateSpace(
    web3: Web3Provider | Wallet,
    address: string,
    spaceId: string,
    settings: any
  ): Promise<ResponseData> {
    let result: ResponseData;
    try {
      snapshot.utils.validateSchema(snapshot.schemas.space, settings);
      const message = await this.signClient.space(web3, address, {
        space: spaceId,
        settings: JSON.stringify(settings)
      });
      result = {
        code: 200,
        data: message as Message
      };
    } catch (error) {
      result = {
        code: 400,
        error: error.error_description
      };
    }
    return result;
  }

  /**
   * Sign create proposal
   * @param web3
   * @param address
   * @param message
   * @returns
   */
  async signCreateProposal(
    web3: Web3Provider | Wallet,
    address: string,
    params: CreateProposalPrams
  ): Promise<ResponseData> {
    let result: ResponseData;
    try {
      const proposal: Proposal = {
        ...params,
        body: "",
        discussion: "",
        labels: [],
        plugins: JSON.stringify({})
      };
      const message = await this.signClient.proposal(web3, address, proposal);
      result = {
        code: 200,
        data: message as Message
      };
    } catch (error) {
      result = {
        code: 400,
        error: error.error_description
      };
    }
    return result;
  }

  /**
   * Sign delete proposal
   * @param web3
   * @param address
   * @param spaceId
   * @param proposalId
   * @returns
   */
  async signDeleteProposal(
    web3: Web3Provider | Wallet,
    address: string,
    spaceId: string,
    proposalId: string
  ): Promise<ResponseData> {
    let result: ResponseData;
    try {
      const message = await this.signClient.cancelProposal(web3, address, {
        space: spaceId,
        proposal: proposalId
      });
      result = {
        code: 200,
        data: message as Message
      };
    } catch (error) {
      result = {
        code: 400,
        error: error.error_description
      };
    }
    return result;
  }

  /**
   * Sign create or update vote
   * @param web3
   * @param address
   * @param message
   * @returns
   */
  async signCreateVote(
    web3: Web3Provider | Wallet,
    address: string,
    params: CreateVotePrams
  ): Promise<ResponseData> {
    let result: ResponseData;
    try {
      const message = await this.signClient.vote(web3, address, params);
      result = {
        code: 200,
        data: message as Message
      };
    } catch (error) {
      result = {
        code: 400,
        error: error.error_description
      };
    }
    return result;
  }

  /**
   * Sign follow space
   * @param web3
   * @param address
   * @param spaceId
   * @param type
   * @param network s: mainnet, s-tn: testnet
   * @returns
   */
  async signFollowSpace(
    web3: Web3Provider | Wallet,
    address: string,
    spaceId: string,
    type: FollowType,
    network = "s"
  ): Promise<ResponseData> {
    let result: ResponseData;
    try {
      let message: any;
      if (type === FollowType.UNFOLLOW) {
        message = await this.signClient.unfollow(web3, address, {
          from: address,
          space: spaceId,
          network: network == "s" ? "s" : "s-tn"
        });
      } else {
        message = await this.signClient.follow(web3, address, {
          from: address,
          space: spaceId,
          network: network == "s" ? "s" : "s-tn"
        });
      }
      result = {
        code: 200,
        data: message as Message
      };
    } catch (error) {
      result = {
        code: 400,
        error: error.error_description
      };
    }
    return result;
  }

  /**
   * Refresh proposal scores
   * (When the proposal.scores_state is pending, proposal.state is closed)
   * @param proposalId
   * @returns boolean
   */
  async refreshProposalScores(proposalId: string): Promise<boolean> {
    try {
      const url = `${this.sequencerUrl}/scores/${proposalId}?${
        this.apiKey ? `apiKey=${this.apiKey}` : ""
      }`;
      const result = await fetchRequest(url);
      return result.result as boolean;
    } catch (error) {
      console.log("error:", error);
      return false;
    }
  }

  /**
   * Flag operation (flag, unflag, verify, hibernate, reactivate)
   * @param params
   * @param secret
   * @returns boolean
   */
  async flagOperation(
    params: FlagOperationParams,
    secret: string
  ): Promise<boolean> {
    try {
      const url = `${this.sequencerUrl}/flag?${
        this.apiKey ? `apiKey=${this.apiKey}` : ""
      }`;
      const initParams: RequestInit = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          secret: secret
        },
        body: JSON.stringify(params)
      };
      const result = await fetchRequest(url, initParams);
      return result.success as boolean;
    } catch (error) {
      console.log("error:", error);
      return false;
    }
  }
}
