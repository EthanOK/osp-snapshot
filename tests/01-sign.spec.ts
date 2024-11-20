import {
  FollowType,
  getBlockNumber,
  SnapShotGraphQLClient,
  SnapShotSignClient,
} from "../src";
import { expect } from "chai";
import { Wallet } from "@ethersproject/wallet";
import { Proposal, Vote } from "@snapshot-labs/snapshot.js/src/sign/types";

describe("Test SnapShot Sign Client", () => {
  const web3Provider = new Wallet(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
  );
  const account = web3Provider.address;

  const sequencerUrl = "http://localhost:3001";
  const signClient = new SnapShotSignClient(
    sequencerUrl,
    "osp_snapshot_apiKey"
  );
  const hub_URL = "http://localhost:3000";
  const queryClient = new SnapShotGraphQLClient(hub_URL, "osp_snapshot_apiKey");

  const spaceId_ = "ethan.osp";
  let proposalId_: string;

  it("CreateSpace Or UpdateSpace", async () => {
    const settings_json = {
      name: "ETHAN.OSP",
      network: "11155111",
      symbol: "OKB",
      avatar: "",
      website: "http://www.github.com",
      twitter: "ethan",
      private: false,
      admins: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"],
      moderators: ["0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2"],
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
            decimals: 18,
          },
        },
      ],
      validation: { name: "any", params: {} },
      voteValidation: { name: "any", params: {} },
      filters: { minScore: 0, onlyMembers: true },
      treasuries: [],
      boost: { enabled: true, bribeEnabled: false },
    };

    await signClient.signCreateOrUpdateSpace(
      web3Provider,
      account,
      spaceId_,
      settings_json
    );
  });

  it("CreateProposal", async () => {
    const data = await queryClient.querySpace(spaceId_);
    const blockNumber = await getBlockNumber(data.network);
    const timestamp = Math.floor(Date.now() / 1e3);
    const proposal_message: Proposal = {
      space: spaceId_,
      type: "single-choice",
      title: "Test Proposal_" + timestamp,
      body: "This is a test proposal body",
      discussion: "",
      choices: ["Choice 1", "Choice 2", "Choice 3", "Choice 4"],
      labels: [],
      start: timestamp,
      end: timestamp + 6000,
      snapshot: blockNumber,
      plugins: JSON.stringify({}),
      app: "ops_snapshot",
      timestamp: timestamp,
    };

    const result = await signClient.signCreateProposal(
      web3Provider,
      account,
      proposal_message
    );
    proposalId_ = result.id;
  });

  //   it("DeleteProposal", async () => {
  //     const result = await signClient.signDeleteProposal(
  //       web3Provider,
  //       account,
  //       spaceId,
  //       proposalId
  //     );
  //   });

  it("VoteProposal", async () => {
    const vote_message: Vote = {
      space: spaceId_,
      proposal: proposalId_,
      type: "single-choice",
      choice: 3,
      app: "ops_snapshot",
      reason: "like 3",
    };

    await signClient.signCreateOrUpdateVote(
      web3Provider,
      account,
      vote_message
    );
  });

  it("FollowSpace", async () => {
    const follow_data = await queryClient.queryFollowSpace(account, spaceId_);
    const isFollow = follow_data.length > 0;
    const result = await signClient.signFollowSpace(
      web3Provider,
      account,
      spaceId_,
      isFollow ? FollowType.UNFOLLOW : FollowType.FOLLOW
    );
  });

  it("Refresh Proposal Scores", async () => {
    const result = await signClient.refreshProposalScores(proposalId_);
    expect(result).to.be.true;
  });
});
