import { ProposalState, ScoreClient, SnapShotGraphQLClient } from "../src";
import { expect } from "chai";
import { hubUrl, osp_spaceId, scoreApiUrl } from "./config";

describe("Test Score Client", () => {
  const queryClient = new SnapShotGraphQLClient(hubUrl, "osp_snapshot_apiKey");
  const scoreClient = new ScoreClient(scoreApiUrl, "osp_snapshot_apiKey");
  let proposal: any;
  const butter_user_bind_eoa = "0x000000B1cf3c8Df89d748DcBEA3C970E1bcf4039";
  const butter_user_aa = "0xeb81272ADf2Cdc9620eF2eE8B237497917FaA56d";

  it("get voting power account in proposal", async () => {
    proposal = await queryClient.queryProposal(
      "0xf9c9c362ae9318dcd5fe6c95c997904fa1e2d82f8f1bd7dc83d8ab19ed3eb596"
    );

    const vp = await scoreClient.getVotingPower(
      butter_user_bind_eoa,
      proposal.network,
      proposal.strategies,
      proposal.snapshot,
      proposal.space.id
    );
    console.log("vp:", vp);
  });

  it("validate account have proposal power", async () => {
    const space = await queryClient.querySpace(osp_spaceId);
    const validate = await scoreClient.proposalValidate(
      space.validation,
      space.strategies,
      butter_user_aa,
      space.network,
      space.id
    );
    console.log("validate proposal power:", validate);
  });

  it("validate account have vote power", async () => {
    const validate = await scoreClient.voteValidate(
      proposal.validation,
      proposal.strategies,
      butter_user_aa,
      proposal.network,
      proposal.space.id
    );
    console.log("validate vote power:", validate);
  });

  it("get scores accounts in proposal", async () => {
    const scores = await scoreClient.getScores(
      ["0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2", butter_user_bind_eoa],
      proposal.network,
      proposal.strategies,
      proposal.snapshot,
      proposal.space.id
    );
    console.log("scores:", scores);
  });

  it("get strategies", async () => {
    const strategies = await scoreClient.getStrategies();
    expect(strategies).to.not.equal(null);
  });

  it("get validations", async () => {
    const validations = await scoreClient.getValidations();
    expect(validations).to.not.equal(null);
  });
}).timeout(100000);
