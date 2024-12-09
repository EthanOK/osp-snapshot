import {
  ChoiceType,
  CreateProposalPrams,
  FollowType,
  getBlockNumber,
  ProposalState,
  SnapShotGraphQLClient,
  SnapShotSignClient,
  CreateVotePrams
} from "osp-snapshot-sdk";
import { assert, expect } from "chai";
import { Wallet } from "@ethersproject/wallet";
import dotenv from "dotenv";
import { butterSpaceId, hubUrl, sequencerUrl } from "./config";
dotenv.config();

describe("Test SnapShot Sign Client", () => {
  const spaceOwner_provider = new Wallet(process.env.PRIVATE_KEY_SIGNATURE!);
  const spaceOwner = spaceOwner_provider.address;
  const butter_user_provider = new Wallet(process.env.PRIVATE_KEY_WEB3AUTH);
  const butter_user_aa = "0xeb81272ADf2Cdc9620eF2eE8B237497917FaA56d";

  const signClient = new SnapShotSignClient(
    sequencerUrl,
    "osp_snapshot_apiKey"
  );
  const queryClient = new SnapShotGraphQLClient(hubUrl, "osp_snapshot_apiKey");
  const spaceId_ = butterSpaceId;
  let proposalId_: string;
  let proposalId_multi_: string;
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

    const response = await signClient.signCreateOrUpdateSpace(
      spaceOwner_provider,
      spaceOwner,
      "butter.official.osp",
      settings_json
    );
    expect(response.code).to.be.equal(200);
    console.log("CreateSpace Or UpdateSpace", response);
  }).timeout(10000);

  it("Create single-choice Proposal", async () => {
    const data = await queryClient.querySpace(spaceId_);
    const blockNumber = await getBlockNumber(data.network);
    const timestamp = Math.floor(Date.now() / 1e3);

    const proposal_params: CreateProposalPrams = {
      space: spaceId_,
      type: ChoiceType.SINGLE,
      title: "single-choice Proposal " + timestamp,
      choices: ["Choice 1", "Choice 2", "Choice 3", "Choice 4"],
      start: timestamp,
      end: timestamp + 1200,
      snapshot: blockNumber
    };

    const response = await signClient.signCreateProposal(
      butter_user_provider,
      butter_user_aa,
      proposal_params
    );
    proposalId_ = response.data.id;
    global.proposalId = proposalId_;
    expect(response.code).to.be.equal(200);
    console.log("Create single-choice Proposal\n", response);
  }).timeout(10000);

  it("Create mutiple-choice Proposal", async () => {
    const data = await queryClient.querySpace(spaceId_);
    const blockNumber = await getBlockNumber(data.network);
    const timestamp = Math.floor(Date.now() / 1e3);

    const proposal_params: CreateProposalPrams = {
      space: spaceId_,
      type: ChoiceType.MULTIPLE,
      title: "multiple-choice Proposal " + timestamp,
      choices: ["Choice 1", "Choice 2", "Choice 3", "Choice 4"],
      start: timestamp,
      end: timestamp + 1200,
      snapshot: blockNumber
    };

    const response = await signClient.signCreateProposal(
      butter_user_provider,
      butter_user_aa,
      proposal_params
    );
    proposalId_multi_ = response.data.id;
    expect(response.code).to.be.equal(200);
    console.log("Create mutiple-choice Proposal\n", response);
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
      butter_user_aa,
      spaceId_,
      prroposals[prroposals.length - 1].id
    );
    expect(message).to.be.not.null;
  });

  it("Vote single Proposal", async () => {
    const vote_message: CreateVotePrams = {
      space: spaceId_,
      proposal: proposalId_,
      type: ChoiceType.SINGLE,
      choice: 1
    };

    const response = await signClient.signCreateVote(
      butter_user_provider,
      butter_user_aa,
      vote_message
    );

    expect(response.code).to.be.equal(200);
    console.log("Vote single Proposal\n", response);
  }).timeout(10000);

  it("Vote single Proposal Should failure", async () => {
    const vote_message: CreateVotePrams = {
      space: spaceId_,
      proposal: proposalId_,
      type: ChoiceType.SINGLE,
      choice: 1
    };

    const response = await signClient.signCreateVote(
      butter_user_provider,
      butter_user_aa,
      vote_message
    );

    expect(response.code).to.be.equal(400);
    console.log("Vote single Proposal Should failure\n", response);
  }).timeout(10000);

  it("Vote multiple Proposal", async () => {
    const vote_message: CreateVotePrams = {
      space: spaceId_,
      proposal: proposalId_multi_,
      type: ChoiceType.MULTIPLE,
      // [1] [2] [1, 2]
      choice: [1, 4]
    };

    const response = await signClient.signCreateVote(
      butter_user_provider,
      butter_user_aa,
      vote_message
    );

    expect(response.code).to.be.equal(200);
    console.log("Vote multiple Proposal\n", response);
  }).timeout(10000);

  it("FollowSpace", async () => {
    const follow_data = await queryClient.queryFollowSpace(
      butter_user_aa,
      spaceId_
    );
    const isFollow = follow_data.length > 0;
    const response = await signClient.signFollowSpace(
      butter_user_provider,
      butter_user_aa,
      spaceId_,
      isFollow ? FollowType.UNFOLLOW : FollowType.FOLLOW
    );
    expect(response.code).to.be.equal(200);
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
