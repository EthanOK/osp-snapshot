import {
  pinGraph,
  ProposalState,
  ScoreClient,
  SnapShotGraphQLClient
} from "../src";
import { expect } from "chai";

describe("Test Boost Client", () => {
  const timestamp = Math.floor(Date.now() / 1e3);
  it("pin graph", async () => {
    const data = {
      name: "Boost",
      description: "Snapshot.org proposal boost. " + timestamp,
      image: "https://snapshot.org/boost.png",
      external_url:
        "https://snapshot.org/#/oneone.eth/proposal/0x214288542f501685317f4d4cfb8c17f3ff84b52c4e1766096736e12251ab3613",
      strategyName: "proposal",
      params: {
        version: "0.0.1",
        env: "snapshot",
        proposal:
          "0x214288542f501685317f4d4cfb8c17f3ff84b52c4e1766096736e12251ab3613",
        eligibility: { type: "incentive" },
        distribution: { type: "lottery", numWinners: "2" }
      }
    };

    const ipfs = await pinGraph(data);
    console.log(ipfs.cid);
  });
});
