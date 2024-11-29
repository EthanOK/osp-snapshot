import {
  FollowType,
  getBlockNumber,
  ProposalState,
  SnapShotGraphQLClient,
  SnapShotSignClient
} from "../src";
import { assert, expect } from "chai";
import { Wallet } from "@ethersproject/wallet";
import { Proposal, Vote } from "@snapshot-labs/snapshot.js/src/sign/types";
import dotenv from "dotenv";
dotenv.config();

describe("Test SnapShot Sign Client", () => {
  const web3Provider = new Wallet(process.env.PRIVATE_KEY_SIGNATURE!);
  const web3Provider2 = new Wallet(process.env.PRIVATE_KEY_SIGNATURE2!);
  const account = web3Provider.address;
  const account2 = web3Provider2.address;

  const sequencerUrl = "http://localhost:3001";
  const signClient = new SnapShotSignClient(
    sequencerUrl,
    "osp_snapshot_apiKey"
  );
  const hub_URL = "http://localhost:3000";
  const queryClient = new SnapShotGraphQLClient(hub_URL, "osp_snapshot_apiKey");

  const spaceId_ = "ethan.osp";
  let proposalId_: string;
  global.createBoost = true;

  it("CreateSpace Or UpdateSpace", async () => {
    const settings_json = {
      name: "Butter.OSP",
      network: "11155111",
      symbol: "OKB",
      avatar: "",
      website: "http://www.github.com",
      twitter: "ethan",
      private: false,
      admins: [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2"
      ],
      moderators: [],
      members: [],
      categories: ["service"],
      labels: [],
      plugins: {},
      children: [],
      voting: { quorum: 0, hideAbstain: false },
      strategies: [
        {
          name: "erc20-balance-of",
          network: "11155111",
          params: {
            symbol: "OKB",
            address: "0x3F4B6664338F23d2397c953f2AB4Ce8031663f80",
            network: "11155111",
            decimals: 18
          }
        }
      ],
      validation: { name: "any", params: {} },
      voteValidation: { name: "any", params: {} },
      filters: { minScore: 0, onlyMembers: true },
      treasuries: [],
      boost: { enabled: true, bribeEnabled: false }
    };

    const message = await signClient.signCreateOrUpdateSpace(
      web3Provider,
      account,
      "butter.official.osp",
      settings_json
    );
    expect(message).to.be.not.null;
  }).timeout(10000);

  it("CreateProposal", async () => {
    const data = await queryClient.querySpace(spaceId_);
    const blockNumber = await getBlockNumber(data.network);
    const timestamp = Math.floor(Date.now() / 1e3);
    const proposal_message: Proposal = {
      space: spaceId_,
      type: "single-choice",
      title: "Test Proposal_" + timestamp,
      body: "",
      discussion: "",
      choices: ["Choice 1", "Choice 2", "Choice 3", "Choice 4"],
      labels: [],
      start: timestamp,
      end: timestamp + 120,
      snapshot: blockNumber,
      plugins: JSON.stringify({}),
      app: "ops_snapshot",
      timestamp: timestamp
    };

    const message = await signClient.signCreateProposal(
      web3Provider,
      account,
      proposal_message
    );
    proposalId_ = message.id;
    global.proposalId = message.id;
    expect(message).to.be.not.null;
  }).timeout(10000);

  it("DeleteProposal", async () => {
    const prroposals = await queryClient.queryProposals({
      spaceIds: [spaceId_],
      state: ProposalState.CLOSED
    });
    if (prroposals.length == 0) {
      return;
    }

    const message = await signClient.signDeleteProposal(
      web3Provider,
      account,
      spaceId_,
      prroposals[prroposals.length - 1].id
    );
    expect(message).to.be.not.null;
  });

  it("VoteProposal", async () => {
    const vote_message: Vote = {
      from: account,
      space: spaceId_,
      proposal: proposalId_,
      type: "single-choice",
      choice: 3,
      app: "ops_snapshot",
      reason: "like 3"
    };

    const message = await signClient.signCreateOrUpdateVote(
      web3Provider,
      account,
      vote_message
    );
    const vote_message2 = vote_message;
    vote_message2.choice = 2;
    vote_message2.from = account2;
    console.log(vote_message2);

    const message2 = await signClient.signCreateOrUpdateVote(
      web3Provider2,
      account2,
      vote_message2
    );
    expect(message).to.be.not.null;
    expect(message2).to.be.not.null;
  });

  it("FollowSpace", async () => {
    const follow_data = await queryClient.queryFollowSpace(account, spaceId_);
    const isFollow = follow_data.length > 0;
    const message = await signClient.signFollowSpace(
      web3Provider,
      account,
      spaceId_,
      isFollow ? FollowType.UNFOLLOW : FollowType.FOLLOW
    );
    expect(message).to.be.not.null;
  });

  it("Refresh Proposal Scores", async () => {
    const result = await signClient.refreshProposalScores(proposalId_);
    expect(result).to.be.true;
  });

  it("Flag Operation", async () => {
    const result = await signClient.flagOperation(
      {
        type: "space",
        action: "verify",
        value: "ethan.osp"
      },
      "osp"
    );
    expect(result).to.be.true;
  });
});
