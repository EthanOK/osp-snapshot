import { ScoreClient, SnapShotGraphQLClient } from "../src";

async function main() {
  const hub_URL = "http://localhost:3000";
  const score_URL = "http://localhost:3003";
  const queryClient = new SnapShotGraphQLClient(hub_URL, "osp_snapshot_apiKey");
  const scoreClient = new ScoreClient(score_URL, "osp_snapshot_apiKey");

  try {
    const spaces = await queryClient.queryFollowSpace(
      "0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2"
    );
    console.log(spaces);
    const proposal = await queryClient.queryProposal(
      "0xcb3b86050bf255ba88893c633ee80f6abbf3dae30e49705f03edffcb6819c312"
    );
    const vp = await scoreClient.getVotingPower(
      "0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2",
      proposal.network,
      proposal.strategies,
      proposal.snapshot,
      proposal.space
    );
    console.log(vp);

    const scores = await scoreClient.getScores(
      [
        "0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2",
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      ],
      proposal.network,
      proposal.strategies,
      proposal.snapshot,
      proposal.space
    );
    console.log(scores);
  } catch (error) {
    console.log(error);
  }
}

main();
