import { ProposalState, ScoreClient, SnapShotGraphQLClient } from "../src";
import { expect } from "chai";

describe("Test Score Client", () => {
  const hub_URL = "http://localhost:3000";
  const score_URL = "http://localhost:3003";
  const queryClient = new SnapShotGraphQLClient(hub_URL, "osp_snapshot_apiKey");
  const scoreClient = new ScoreClient(score_URL, "osp_snapshot_apiKey");
  let proposal: any;
  const account = "0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2";

  it("get voting power account in proposal", async () => {
    proposal = await queryClient.queryProposal(
      "0x214288542f501685317f4d4cfb8c17f3ff84b52c4e1766096736e12251ab3613"
    );

    const vp = await scoreClient.getVotingPower(
      account,
      proposal.network,
      proposal.strategies,
      proposal.snapshot,
      proposal.space.id
    );
    console.log("vp:", vp);
  });

  it("validate account have vote power", async () => {
    const validate = await scoreClient.validate(
      proposal.validation.name,
      proposal.validation.params,
      proposal.strategies,
      account,
      proposal.network,
      proposal.snapshot,
      proposal.space.id
    );
    console.log("validate:", validate);
  });

  it("get scores accounts in proposal", async () => {
    const scores = await scoreClient.getScores(
      [
        "0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2",
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
      ],
      proposal.network,
      proposal.strategies,
      proposal.snapshot,
      proposal.space.id
    );
    console.log("scores:", scores);
  });

  it("get strategies", async () => {
    const strategies = await scoreClient.getStrategies();
    expect(strategies).to.not.be.null;
  });

  it("get validations", async () => {
    const validations = await scoreClient.getValidations();
    expect(validations).to.not.be.null;
  });
});
