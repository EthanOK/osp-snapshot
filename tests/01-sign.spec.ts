import {
  CreateProposalPrams,
  FollowType,
  getBlockNumber,
  ProposalState,
  SnapShotGraphQLClient,
  SnapShotSignClient,
  VotePrams
} from "../src";
import { assert, expect } from "chai";
import { Wallet } from "@ethersproject/wallet";
import dotenv from "dotenv";
import { butterSpaceId, hubUrl, sequencerUrl } from "./config";
dotenv.config();

describe("Test SnapShot Sign Client", () => {
  const spaceOwner_provider = new Wallet(process.env.PRIVATE_KEY_SIGNATURE!);
  const butter_user_provider = new Wallet(process.env.PRIVATE_KEY_WEB3AUTH);
  const spaceOwner = spaceOwner_provider.address;
  const butter_user = butter_user_provider.address;

  const signClient = new SnapShotSignClient(
    sequencerUrl,
    "osp_snapshot_apiKey"
  );
  const queryClient = new SnapShotGraphQLClient(hubUrl, "osp_snapshot_apiKey");
  const spaceId_ = butterSpaceId;
  let proposalId_: string;
  global.createBoost = true;

  it("CreateSpace Or UpdateSpace", async () => {
    return;
    const settings_json = {
      name: "Butter.OSP",
      network: "204",
      symbol: "Butter",
      twitter: "breadnbutter",
      website: "http://m.breadnbutter.fun",
      private: false,
      admins: ["0x6278a1e803a76796a3a1f7f6344fe874ebfe94b2"],
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
          name: "erc20-balance-of",
          network: "56",
          params: {
            symbol: "Butter",
            address: "0x5867CBf2A3fA758C063e8A2deeAF0De8d71C3eF4",
            decimals: 18
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
                symbol: "OSPP",
                address: "0x00000066C6C6fCa286F48A7f4E989b7198c26cAf"
              },
              network: "204"
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
                symbol: "OSPP",
                address: "0x00000066C6C6fCa286F48A7f4E989b7198c26cAf"
              },
              network: "204"
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

    const message = await signClient.signCreateOrUpdateSpace(
      spaceOwner_provider,
      spaceOwner,
      "butter.official.osp",
      settings_json
    );
    expect(message).to.be.not.null;
  }).timeout(10000);

  it("CreateProposal", async () => {
    const data = await queryClient.querySpace(spaceId_);
    const blockNumber = await getBlockNumber(data.network);
    const timestamp = Math.floor(Date.now() / 1e3);

    // 单选 single-choice
    const proposal_params: CreateProposalPrams = {
      space: spaceId_,
      type: "single-choice",
      title: "single-choice Proposal " + timestamp,
      choices: ["Choice 1", "Choice 2", "Choice 3", "Choice 4"],
      start: timestamp,
      end: timestamp + 120,
      snapshot: blockNumber
    };
    // 多选 approval
    const proposal_params_: CreateProposalPrams = {
      space: spaceId_,
      type: "approval",
      title: "multiple-choice Proposal " + timestamp,
      choices: ["Choice 1", "Choice 2", "Choice 3", "Choice 4"],
      start: timestamp,
      end: timestamp + 120,
      snapshot: blockNumber
    };

    const message = await signClient.signCreateProposal(
      butter_user_provider,
      butter_user,
      proposal_params
    );
    proposalId_ = message.id;
    global.proposalId = message.id;
    expect(message).to.be.not.null;
  }).timeout(100000);

  it("DeleteProposal", async () => {
    return;
    const prroposals = await queryClient.queryProposals({
      spaceIds: [spaceId_],
      state: ProposalState.CLOSED
    });
    if (prroposals.length == 0) {
      return;
    }

    const message = await signClient.signDeleteProposal(
      butter_user_provider,
      butter_user,
      spaceId_,
      prroposals[prroposals.length - 1].id
    );
    expect(message).to.be.not.null;
  });

  it("VoteProposal", async () => {
    // 单选 single-choice
    const vote_message: VotePrams = {
      space: spaceId_,
      proposal: proposalId_,
      type: "single-choice",
      choice: 1
    };

    // 多选 approval
    const vote_message_: VotePrams = {
      space: spaceId_,
      proposal: proposalId_,
      type: "approval",
      choice: [1, 4]
    };

    const message = await signClient.signCreateOrUpdateVote(
      butter_user_provider,
      butter_user,
      vote_message
    );

    expect(message).to.be.not.null;
  }).timeout(10000);

  it("FollowSpace", async () => {
    const follow_data = await queryClient.queryFollowSpace(
      butter_user,
      spaceId_
    );
    const isFollow = follow_data.length > 0;
    const message = await signClient.signFollowSpace(
      butter_user_provider,
      butter_user,
      spaceId_,
      isFollow ? FollowType.UNFOLLOW : FollowType.FOLLOW
    );
    expect(message).to.be.not.null;
  });

  it("Refresh Proposal Scores When Proposal End", async () => {
    const result = await signClient.refreshProposalScores(proposalId_);
    expect(result).to.be.true;
  });

  it("Flag Operation", async () => {
    const result = await signClient.flagOperation(
      {
        type: "space",
        action: "verify",
        value: spaceId_
      },
      "osp"
    );
    expect(result).to.be.true;
  });
}).timeout(100000);
