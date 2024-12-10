import { ProposalState, SnapShotGraphQLClient } from "../src";
import { expect } from "chai";
import dotenv from "dotenv";
import { butterSpaceId, hubUrl } from "./config";
dotenv.config();

describe("Test SnapShot GraphQL Client", () => {
  const queryClient = new SnapShotGraphQLClient(hubUrl, "osp_snapshot_apiKey");

  const spaceId_ = butterSpaceId;
  let proposalId_ = null;
  let voter_ = null;

  it("query Spaces Rankings", async () => {
    const data = await queryClient.querySpacesRankings();
    expect(Array.isArray(data.items)).to.equal(true);
    expect(data.items.length).to.be.greaterThanOrEqual(0);
    if (data.items.length > 0) {
      for (const item of data.items) {
        console.log("spaceId:", item.id);
      }
    }
  });

  it("query Space", async () => {
    const data = await queryClient.querySpace(spaceId_);
    expect(data.id).to.be.equal(spaceId_);
    expect(typeof data.name === "string").to.equal(true);
  });

  it("queryProposals by spaceIds", async () => {
    const proposals = await queryClient.queryProposals({
      spaceIds: [spaceId_],
      first: 10,
      state: ProposalState.ACTIVE,
      // voter_not: "0xeb81272ADf2Cdc9620eF2eE8B237497917FaA56d",
      orderBy: "votes"
    });
    console.log("proposals number:", proposals.length);
    for (const proposal of proposals) {
      console.log("votes", proposal.votes, "proposalId:", proposal.id);
      if (proposalId_ === null) {
        proposalId_ = proposal.id;
      }
    }
  });

  it("queryProposal by proposalId", async () => {
    const proposal = await queryClient.queryProposal(proposalId_);
    console.log("proposal author:", proposal.author);
  });

  it("queryVotes by voter in proposalIds", async () => {
    const votes = await queryClient.queryUserVotedProposalIds(
      "0xeb81272ADf2Cdc9620eF2eE8B237497917FaA56d",
      [
        "0xcacf444efdbc97e1414e134c096114261e78efd64cdbf43b426c26dd0c28c202",
        "0x65a718112a3a5a669b5749c35163e1fa2d899f070b88a107ce02adbe9903b8e3",
        "0x94d666bcd3b03eed47368a8672bc09051d7e2ea4c30cad7fbff0964d90aa9d69"
      ]
    );
    console.log(JSON.stringify(votes, null, 2));
  }).timeout(10000);

  it("queryVotes by proposalId", async () => {
    const voteslist = await queryClient.queryVotesByProposalId(
      {
        proposalId: proposalId_
      },
      0
    );
    console.log("votes list:\n", voteslist);
    voter_ = voteslist[0].voter;
  });

  it("queryVotes by proposalId and voter", async () => {
    const votes = await queryClient.queryVotesByProposalId({
      proposalId: proposalId_,
      voter: voter_
    });
    console.log("vote", votes);
  });

  it("queryVotes by voter", async () => {
    const data = await queryClient.queryVotesByVoter(voter_);
    console.log(JSON.stringify(data, null, 2));

    console.log("votes number:", data.length);
    if (data.length > 0) {
      for (const item of data) {
        console.log(
          `${voter_.substring(0, 8)} choice ${item.choice} in proposal ${
            item.proposal.id
          }`
        );
      }
    }
  });

  it("queryFollowSpace", async () => {
    const data = await queryClient.queryFollowSpace(voter_);
    console.log(data);
    for (const item of data) {
      console.log("follow space:", item.space.id);
    }
  });
}).timeout(100000);
