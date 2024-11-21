import { ScoreClient, SnapShotGraphQLClient } from "../src";

async function main() {
  const hub_URL = "http://localhost:3000";
  const score_URL = "http://localhost:3003";
  const queryClient = new SnapShotGraphQLClient(hub_URL, "osp_snapshot_apiKey");
  const scoreClient = new ScoreClient(score_URL, "osp_snapshot_apiKey");

  try {
    const proposal = await queryClient.queryProposal(
      "0x214288542f501685317f4d4cfb8c17f3ff84b52c4e1766096736e12251ab3613"
    );
    console.log(proposal);

    const account = "0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2";

    const validate = await scoreClient.validate(
      proposal.validation.name,
      proposal.validation.params,
      proposal.strategies,
      account,
      proposal.network,
      proposal.snapshot,
      proposal.space.id
    );
    console.log("validate", validate);
  } catch (error) {
    console.log(error);
  }
}

main();
