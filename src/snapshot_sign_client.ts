import snapshot from "@snapshot-labs/snapshot.js";
import { Web3Provider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { Proposal, Vote } from "@snapshot-labs/snapshot.js/src/sign/types";
import Client from "@snapshot-labs/snapshot.js/dist/src/sign";

/**
 * Follow type
 */
export enum FollowType {
  FOLLOW = "follow",
  UNFOLLOW = "unfollow",
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
  ) {
    try {
      snapshot.utils.validateSchema(snapshot.schemas.space, settings);
      const result = await this.signClient.space(web3, address, {
        space: spaceId,
        settings: JSON.stringify(settings),
      });
      console.log("result:", result);
      return result;
    } catch (error) {
      console.log("error:", error);
      return null;
    }
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
    message: Proposal
  ) {
    try {
      const result = await this.signClient.proposal(web3, address, message);
      console.log("result:", result);
      return result;
    } catch (error) {
      console.log("error:", error);
      return null;
    }
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
  ) {
    try {
      const result = await this.signClient.cancelProposal(web3, address, {
        space: spaceId,
        proposal: proposalId,
      });
      console.log("result:", result);
      return result;
    } catch (error) {
      console.log("error:", error);
      return null;
    }
  }

  /**
   * Sign create or update vote
   * @param web3
   * @param address
   * @param message
   * @returns
   */
  async signCreateOrUpdateVote(
    web3: Web3Provider | Wallet,
    address: string,
    message: Vote
  ) {
    try {
      const result = await this.signClient.vote(web3, address, message);
      console.log("result:", result);
      return result;
    } catch (error) {
      console.log("error:", error);
      return null;
    }
  }

  /**
   * Sign set alias
   * @param web3
   * @param address
   * @param alias
   * @returns
   */
  async signSetAlias(
    web3: Web3Provider | Wallet,
    address: string,
    alias: string
  ) {
    try {
      const result = await this.signClient.alias(web3, address, {
        alias: alias,
      });
      console.log("result:", result);
      return result;
    } catch (error) {
      console.log("error:", error);
      return null;
    }
  }

  /**
   *
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
  ) {
    try {
      let result: any;
      if (type === FollowType.UNFOLLOW) {
        result = await this.signClient.unfollow(web3, address, {
          from: address,
          space: spaceId,
          network: network == "s" ? "s" : "s-tn",
        });
      } else {
        result = await this.signClient.follow(web3, address, {
          from: address,
          space: spaceId,
          network: network == "s" ? "s" : "s-tn",
        });
      }

      console.log("result:", result);
      return result;
    } catch (error) {
      console.log("error:", error);
    }
  }

  /**
   * Refresh proposal scores
   * When the proposal.scores_state is pending, proposal.state is closed
   * @param proposalId
   * @returns
   */
  async refreshProposalScores(proposalId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.sequencerUrl}/scores/${proposalId}?${
          this.apiKey ? `apiKey=${this.apiKey}` : ""
        }`
      );

      const result: any = await response.json();
      console.log("result:", result.result);
      return result as boolean;
    } catch (error) {
      console.log("error:", error);
      return false;
    }
  }
}
