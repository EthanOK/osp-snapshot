import {
  BoostGuardClient,
  createBoost,
  Distribution,
  Eligibility,
  getBoosts,
  getProvider,
  getStrategyURI,
  SnapShotGraphQLClient,
  TWO_WEEKS
} from "../src";
import { expect } from "chai";
import { Wallet } from "@ethersproject/wallet";
import dotenv from "dotenv";
dotenv.config();

const wallet = new Wallet(process.env.PRIVATE_KEY!).connect(
  getProvider("11155111")
);

// global.proposalId =
//   "0x3b9dd063ca30e9d3416f94df1a04d16a235b3362a687a7a76fae0790474113b7";

describe("Test Boost Client", () => {
  const uri = "http://localhost:8090";
  const boostGuardClient = new BoostGuardClient(uri);
  const hub_URL = "http://localhost:3000";
  const queryClient = new SnapShotGraphQLClient(hub_URL, "osp_snapshot_apiKey");

  let strategyURI: string;
  let guardAddress: string;

  it("Get Strategy URI from IFPS", async () => {
    // Read global.proposalId
    const proposalId_ = global.proposalId;

    const eligibility: Eligibility = {
      type: "incentive"
    };
    const distribution: Distribution = {
      type: "lottery",
      numWinners: "1"
    };
    strategyURI = await getStrategyURI(proposalId_, eligibility, distribution);
    expect(strategyURI).to.not.be.null;
  });

  it("Get boost guard address from boostGuardClient", async () => {
    guardAddress = await boostGuardClient.getGuardAddress();
    expect(guardAddress).to.not.be.null;
  });

  it("Create Boost On Chain", async () => {
    const proposalId_ = global.proposalId;
    const proposal = await queryClient.queryProposal(proposalId_);
    try {
      const createTx = await createBoost(wallet, "11155111", "0", {
        strategyURI: strategyURI,
        token: "0x3F4B6664338F23d2397c953f2AB4Ce8031663f80",
        amount: "100000000000000",
        owner: wallet.address,
        guard: guardAddress,
        start: proposal.end,
        end: proposal.end + TWO_WEEKS
      });
      const resp = await createTx.wait();
      console.log("transactionHash:", resp.transactionHash);
    } catch (error) {
      console.log(error);
    }
  }).timeout(100000);

  it("Get boost from subgraph ", async () => {
    const proposalId_ = global.proposalId;
    const boosts = await getBoosts([proposalId_]);
    console.log(boosts);
  });
});
