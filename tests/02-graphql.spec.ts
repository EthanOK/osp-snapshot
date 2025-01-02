import { ProposalState, SnapShotGraphQLClient } from "../src";
import { expect } from "chai";
import { hubUrl, osp_spaceId } from "./config";

describe("Test SnapShot GraphQL Client", () => {
  const queryClient = new SnapShotGraphQLClient(hubUrl, "osp_snapshot_apiKey");
  const spaceId_ = osp_spaceId;
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
      state: ProposalState.ALL,
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

  it("queryProposals by voter_not in spaceId", async () => {
    // voter_not is null or "" all proposals in space
    const proposals = await queryClient.queryProposals({
      spaceIds: [spaceId_],
      first: 10,
      state: ProposalState.ACTIVE,
      voter_not: "0xbc93cBC8F46f681aA4D31291CF5655B2f82AD2eE",
      orderBy: "votes"
    });
    console.log("proposals number:", proposals.length);
    console.log(JSON.stringify(proposals, null, 2));
  });

  it("queryProposal by proposalId", async () => {
    const proposal = await queryClient.queryProposal(proposalId_);
    console.log("proposal author:", proposal.author);
  });

  it("queryProposals by proposalIds", async () => {
    const proposals = await queryClient.queryProposals({
      ids: [
        "0xf1ddac876a8a1a4db0210a35001e5675a238adeebd6c78171df8315c9ffbe29a",
        "0xfc5f3b66957792cf490721a3410888ccfdbe33d45f6647f46e494726f09dff13",
        "0x00bff8eb6350c44c87d2e44caf112afbc23a88d04994f65380830a49378d6f57"
      ],
      first: 10,
      state: ProposalState.ALL
    });
    console.log(JSON.stringify(proposals, null, 2));
  });

  it("queryVotes by voter in proposalIds", async () => {
    const votes = await queryClient.queryUserVotedProposalIds(
      "0xeb81272ADf2Cdc9620eF2eE8B237497917FaA56d",
      [
        "0x8a86e6ed918e2d6126ae2d2a183ffcb32d56f454183430d81e5a306105134854",
        "0xf1ddac876a8a1a4db0210a35001e5675a238adeebd6c78171df8315c9ffbe29a",
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
    for (const item of data) {
      console.log("follow space:", item.space.id);
    }
  });
}).timeout(100000);
