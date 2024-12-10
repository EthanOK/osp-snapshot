import {
  BoostGuardClient,
  BoostVoucherGuard,
  claimAllTokens,
  claimTokens,
  createBoost,
  Distribution,
  Eligibility,
  getBoosts,
  getClaims,
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

if (global.createBoost == undefined) {
  // TODO: Change global proposalId
  global.proposalId =
    "0x7fb1eba490a360449c454014ed59d01902007713183c5757ae85740ba87330ca";
}

describe("Test Boost Client", () => {
  const uri = "http://127.0.0.1:8090";
  const boostGuardClient = new BoostGuardClient(uri);
  const hub_URL = "http://localhost:3000";
  const queryClient = new SnapShotGraphQLClient(hub_URL, "osp_snapshot_apiKey");

  const strategyURIs: string[] = [];
  let guardAddress: string;
  let vouchers: BoostVoucherGuard[];

  it("Get Strategy URI from IFPS", async () => {
    // Read global.proposalId
    const proposalId_ = global.proposalId;
    if (proposalId_ == undefined) {
      return;
    }

    const eligibility: Eligibility = {
      type: "incentive"
    };
    const distribution: Distribution = {
      type: "lottery",
      numWinners: "1"
    };
    const distribution_2: Distribution = {
      type: "weighted"
    };
    const strategyURI = await getStrategyURI(
      proposalId_,
      eligibility,
      distribution
    );
    expect(strategyURI).to.not.equal(null);
    strategyURIs.push(strategyURI);
    const strategyURI_2 = await getStrategyURI(
      proposalId_,
      eligibility,
      distribution_2
    );
    strategyURIs.push(strategyURI_2);
  });

  it("Get boost guard address from boostGuardClient", async () => {
    guardAddress = await boostGuardClient.getGuardAddress();
    expect(guardAddress).to.not.equal(null);
  });

  it("Create Boost On Chain", async () => {
    const proposalId_ = global.proposalId;
    if (proposalId_ == undefined || global.createBoost == undefined) {
      return;
    }
    const proposal = await queryClient.queryProposal(proposalId_);
    try {
      for (const strategyURI of strategyURIs) {
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
      }
    } catch (error) {
      console.log(error);
    }
  }).timeout(100000);

  it("Get boost from subgraph", async () => {
    const proposalId_ = global.proposalId;
    const boosts = await getBoosts([proposalId_]);
    console.log(boosts);
  });

  it("Get Rewards from boost guard client", async () => {
    const proposalId_ = global.proposalId;
    if (proposalId_ == undefined) {
      return;
    }
    const voter = "0x6278a1e803a76796a3a1f7f6344fe874ebfe94b2";
    const boosts = await getBoosts([proposalId_]);
    const boostRewards = await boostGuardClient.getRewards(
      proposalId_,
      voter,
      boosts
    );
    console.log("boostRewards:", boostRewards);
  }).timeout(10000);

  it("Get Winners for lottery boost from boost guard client", async () => {
    const proposalId_ = global.proposalId;
    if (proposalId_ == undefined) {
      return;
    }
    const boosts = await getBoosts([proposalId_]);
    const lottery_boost = boosts.filter(
      (boost) => boost.strategy.distribution.type === "lottery"
    );
    if (lottery_boost.length === 0) {
      return;
    }
    for (const boost of lottery_boost) {
      const winners = await boostGuardClient.getWinners(
        proposalId_,
        boost.id,
        boost.chainId
      );
      console.log("winner:", winners);
    }
  }).timeout(10000);

  it("Get Vouchers from boost guard client", async () => {
    const proposalId_ = global.proposalId;
    if (proposalId_ == undefined) {
      return;
    }
    const voter = "0x6278a1e803a76796a3a1f7f6344fe874ebfe94b2";

    const boosts = await getBoosts([proposalId_]);
    const boostRewards = await boostGuardClient.getRewards(
      proposalId_,
      voter,
      boosts
    );
    const claims = await getClaims(voter);
    const claimed_boost_ids = new Set(claims.map((claim) => claim.boost.id));

    const boost_ids = boostRewards
      .filter((reward) => !claimed_boost_ids.has(reward.boost_id))
      .map((reward) => reward.boost_id);

    const vouchers_boost = boosts.filter((boost) =>
      boost_ids.includes(boost.id)
    );
    vouchers = await boostGuardClient.getVouchers(
      proposalId_,
      voter,
      vouchers_boost
    );
    console.log("Vouchers:", vouchers);
  }).timeout(10000);

  it("Claim Vouchers on Chain", async () => {
    if (vouchers.length == 0) return;

    if (vouchers.length == 1) {
      const claimTx = await claimTokens(
        wallet,
        vouchers[0].chain_id,
        {
          boostId: vouchers[0].boost_id,
          amount: vouchers[0].reward,
          recipient: wallet.address
        },
        vouchers[0].signature
      );

      const resp = await claimTx.wait();
      console.log("transactionHash:", resp.transactionHash);
    } else {
      const claimTx = await claimAllTokens(
        wallet,
        vouchers[0].chain_id,
        vouchers.map((v) => ({
          boostId: v.boost_id,
          amount: v.reward,
          recipient: wallet.address
        })),
        vouchers.map((v) => v.signature)
      );

      const resp = await claimTx.wait();
      console.log("transactionHash:", resp.transactionHash);
    }
  }).timeout(100000);
});
