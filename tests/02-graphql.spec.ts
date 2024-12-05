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
    expect(Array.isArray(data.items)).to.be.true;
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
    expect(typeof data.name === "string").to.be.true;
  });

  it("queryProposals by spaceIds", async () => {
    const proposals = await queryClient.queryProposals({
      spaceIds: [spaceId_],
      first: 10,
      state: ProposalState.ACTIVE,
      orderBy: "scores_total"
    });
    for (const proposal of proposals) {
      console.log(
        "votes:",
        proposal.votes,
        "created:",
        proposal.created,
        "end:",
        proposal.end
      );
      if (proposalId_ === null) {
        proposalId_ = proposal.id;
      }
    }
  });

  it("queryProposal by proposalId", async () => {
    const proposal = await queryClient.queryProposal(proposalId_);
    console.log("proposal author:", proposal.author);
  });

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

  it("queryVotes by voter", async () => {
    const data = await queryClient.queryVotesByVoter(voter_);

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
