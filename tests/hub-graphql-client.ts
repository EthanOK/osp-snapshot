import { ProposalState, ScoreClient, SnapShotGraphQLClient } from "../src";
import { hubUrl } from "./config";

async function main() {
  const hub_URL = "http://localhost:3000";
  const queryClient = new SnapShotGraphQLClient(hubUrl, "osp_snapshot_apiKey");

  try {
    const proposals = await queryClient.queryProposals({
      ids: [
        "0xf1ddac876a8a1a4db0210a35001e5675a238adeebd6c78171df8315c9ffbe29a",
        "0xfc5f3b66957792cf490721a3410888ccfdbe33d45f6647f46e494726f09dff13",
        "0x00bff8eb6350c44c87d2e44caf112afbc23a88d04994f65380830a49378d6f57"
      ],
      first: 10,
      state: ProposalState.ALL
    });
    console.log(proposals);
  } catch (error) {
    console.log(error);
  }
}

main();
