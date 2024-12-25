import snapshot from "@snapshot-labs/snapshot.js";
import { Web3Provider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";

import {
  cancelProposal2Types,
  cancelProposalTypes,
  Proposal,
  ProposalType,
  proposalTypes,
  spaceTypes,
  Vote,
  vote2Types,
  voteArray2Types,
  voteArrayTypes,
  voteString2Types,
  voteStringTypes,
  voteTypes
} from "./utils/sign_types";
import Client from "@snapshot-labs/snapshot.js/dist/src/sign";
import { fetchRequest } from "./utils/util";
import { getAddress } from "@ethersproject/address";
import { ISigner } from "./utils/osp_signer";

/**
 * Follow type
 */
export enum FollowType {
  FOLLOW = "follow",
  UNFOLLOW = "unfollow"
}

const NAME = "snapshot";
const VERSION = "0.1.4";

export const domain: {
  name: string;
  version: string;
  chainId?: number;
} = {
  name: NAME,
  version: VERSION
  // chainId: 1
};
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
  private sequencerUrlWithApiKey: string;

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
    this.sequencerUrlWithApiKey = `${sequencerUrl}?${apiKey ? `apiKey=${apiKey}` : ""}`;
  }

  /**
   * Check if the web3 is OSP ISigner
   * @param web3
   * @returns
   */
  private isISigner(web3: Web3Provider | Wallet | ISigner): web3 is ISigner {
    return (
      typeof web3 === "object" &&
      web3 !== null &&
      "getAddress" in web3 &&
      "signMessage" in web3 &&
      "signTypedData" in web3
    );
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
    web3: Web3Provider | Wallet | ISigner,
    address: string,
    spaceId: string,
    settings: any
  ): Promise<ResponseData> {
    let result: ResponseData;
    try {
      snapshot.utils.validateSchema(snapshot.schemas.space, settings);
      let message;
      if (this.isISigner(web3)) {
        message = await this.sign(
          web3,
          address,
          {
            space: spaceId,
            settings: JSON.stringify(settings)
          },
          spaceTypes
        );
      } else {
        message = await this.signClient.space(web3, address, {
          space: spaceId,
          settings: JSON.stringify(settings)
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

  async getOspJoinNFTBySpaceId(spaceId: string) {
    try {
      const url = `${this.sequencerUrl}/getOspJoinNFTBySpaceId/${spaceId}?${
        this.apiKey ? `apiKey=${this.apiKey}` : ""
      }`;
      const response = await fetchRequest(url);
      if (response.code == 200)
        return {
          code: 200,
          data: {
            createSpace: response.createSpace as boolean,
            joinNFT: response.joinNFT as string,
            chainId: response.chainId as string,
            existSpace: response.existSpace as boolean
          }
        };
      else
        return {
          code: response.code as number,
          error: (response?.message as string) || "error message"
        };
    } catch (error) {
      console.log("error:", error);
      return {
        code: 400,
        error: error?.error || "unknown error"
      };
    }
  }

  private async createSpace(
    web3: Web3Provider | Wallet | ISigner,
    account: string,
    spaceId: string,
    ospJoinNFT: string,
    chainId: string
  ): Promise<ResponseData> {
    const settings_json = {
      name: spaceId.toUpperCase(),
      network: chainId,
      symbol: "Ticket",
      twitter: "",
      website: "",
      private: false,
      admins: [],
      moderators: [],
      members: [],
      categories: ["service"],
      labels: [],
      plugins: {},
      children: [],
      voting: {
        hideAbstain: false
      },
      strategies: [
        {
          name: "ticket",
          network: chainId,
          params: {
            value: 1,
            symbol: "Ticket"
          }
        }
      ],
      validation: {
        name: "basic",
        params: {
          minScore: 1,
          strategies: [
            {
              name: "erc721",
              params: {
                symbol: "OSPJ",
                address: ospJoinNFT
              },
              network: chainId
            }
          ]
        }
      },
      voteValidation: {
        name: "basic",
        params: {
          minScore: 1,
          strategies: [
            {
              name: "erc721",
              params: {
                symbol: "OSPJ",
                address: ospJoinNFT
              },
              network: chainId
            }
          ]
        }
      },
      filters: {
        minScore: 0,
        onlyMembers: false
      },
      treasuries: [],
      boost: {
        enabled: true,
        bribeEnabled: false
      }
    };

    const response = await this.signCreateOrUpdateSpace(
      web3,
      account,
      spaceId,
      settings_json
    );
    return response;
  }

  /**
   * Sign create proposal
   * @param web3
   * @param address
   * @param message
   * @returns
   */
  async signCreateProposal(
    web3: Web3Provider | Wallet | ISigner,
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
      const spaceId = proposal.space;
      const regex = /^((dev|beta|pre|prod)\.\d+\.\d+|\d+(.\d+)?)\.osp$/;
      if (!regex.test(spaceId)) {
        return {
          code: 400,
          error: "Invalid OSP Space Id"
        };
      }
      if (spaceId.startsWith("prod.")) {
        // remove `prod.`
        proposal.space = spaceId.replace("prod.", "");
      }
      let message;
      if (this.isISigner(web3)) {
        if (!proposal.app) proposal.app = "";
        if (!proposal.privacy) proposal.privacy = "";
        message = await this.sign(web3, address, proposal, proposalTypes);
      } else {
        message = await this.signClient.proposal(web3, address, proposal);
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
   * Sign delete proposal
   * @param web3
   * @param address
   * @param spaceId
   * @param proposalId
   * @returns
   */
  async signDeleteProposal(
    web3: Web3Provider | Wallet | ISigner,
    address: string,
    spaceId: string,
    proposalId: string
  ): Promise<ResponseData> {
    let result: ResponseData;
    try {
      let message;
      if (this.isISigner(web3)) {
        const type2 = message.proposal.startsWith("0x");
        message = await this.sign(
          web3,
          address,
          {
            space: spaceId,
            proposal: proposalId
          },
          type2 ? cancelProposal2Types : cancelProposalTypes
        );
      } else {
        message = await this.signClient.cancelProposal(web3, address, {
          space: spaceId,
          proposal: proposalId
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
   * Sign create or update vote
   * @param web3
   * @param address
   * @param message
   * @returns
   */
  async signCreateVote(
    web3: Web3Provider | Wallet | ISigner,
    address: string,
    params: CreateVotePrams
  ): Promise<ResponseData> {
    let result: ResponseData;
    try {
      let message;
      if (this.isISigner(web3)) {
        const vote_message = params as any;
        const isShutter = vote_message?.privacy === "shutter";
        if (!vote_message.reason) vote_message.reason = "";
        if (!vote_message.app) vote_message.app = "";
        if (!vote_message.metadata) vote_message.metadata = "{}";
        const type2 = vote_message.proposal.startsWith("0x");
        let type = type2 ? vote2Types : voteTypes;
        if (["approval", "ranked-choice"].includes(vote_message.type))
          type = type2 ? voteArray2Types : voteArrayTypes;
        if (
          !isShutter &&
          ["quadratic", "weighted"].includes(vote_message.type)
        ) {
          type = type2 ? voteString2Types : voteStringTypes;
          vote_message.choice = JSON.stringify(vote_message.choice);
        }
        if (isShutter) type = type2 ? voteString2Types : voteStringTypes;
        delete vote_message.privacy;
        delete vote_message.type;
        message = await this.sign(web3, address, vote_message, type);
      } else {
        message = await this.signClient.vote(web3, address, params);
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

  async sign(signer: ISigner, address: string, message, types) {
    const checksumAddress = getAddress(address);
    message.from = message.from ? getAddress(message.from) : checksumAddress;
    if (!message.timestamp)
      message.timestamp = parseInt((Date.now() / 1e3).toFixed());

    const domainData = {
      ...domain
    };
    // domainData.chainId = chainId;
    const data: any = { domain: domainData, types, message };
    const sig = await signer.signTypedData(domainData, data.types, message);
    return await this.send({ address: checksumAddress, sig, data });
  }

  async send(envelop) {
    const address = this.sequencerUrlWithApiKey;

    const init = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(envelop)
    };
    return new Promise((resolve, reject) => {
      fetch(address, init)
        .then((res) => {
          if (res.ok) return resolve(res.json());
          if (res.headers.get("content-type")?.includes("application/json"))
            return res.json().then(reject).catch(reject);
          throw res;
        })
        .catch(reject);
    });
  }
}
