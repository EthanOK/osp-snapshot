import { ProposalState, SnapShotGraphQLClient } from "../src";
import { expect } from "chai";

describe("Test SnapShot GraphQL Client", () => {
  const hub_URL = "http://localhost:3000";
  const queryClient = new SnapShotGraphQLClient(hub_URL, "osp_snapshot_apiKey");

  let proposalId_ = null;
  let voter_ = null;
  let spaceId_ = "oneone.eth";

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
      state: ProposalState.ALL,
    });
    for (const proposal of proposals) {
      console.log("proposalId:", proposal.id);
      if (proposalId_ === null) {
        proposalId_ = proposal.id;
      }
    }
  });

  it("queryProposal by proposalId", async () => {
    const proposal = await queryClient.queryProposal(proposalId_);
    console.log("proposal author:", proposal.author);
    voter_ = proposal.author;
  });

  it("queryVotes by proposalId", async () => {
    const data = await queryClient.queryVotesByProposalId(
      {
        proposalId: proposalId_,
      },
      0
    );
    console.log("votes number:", data.length);
  });

  it("queryVotes by voter", async () => {
    const data = await queryClient.queryVotesByVoter(voter_);

    console.log("votes number:", data.length);
    if (data.length > 0) {
      console.log(
        `${voter_} choice ${data[0].choice} in proposal ${data[0].proposal.id}`
      );
    }
  });

  it("queryFollowSpace", async () => {
    const data = await queryClient.queryFollowSpace(voter_);
    for (const item of data) {
      console.log("follow space:", item.space);
    }
  });
});
