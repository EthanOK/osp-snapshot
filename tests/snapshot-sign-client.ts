import { Proposal, Vote } from "@snapshot-labs/snapshot.js/src/sign/types";
import { Wallet } from "@ethersproject/wallet";
import { FollowType, SnapShotSignClient } from "../src";

const web3Provider = new Wallet(
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
);
const account = web3Provider.address;
console.log(account);

async function main() {
  const sequencerUrl = "http://localhost:3001";
  const signClient = new SnapShotSignClient(
    sequencerUrl,
    "osp_snapshot_apiKey"
  );

  const settings_json = {
    name: "ETHAN.OSP",
    network: "11155111",
    symbol: "OKB",
    avatar: "",
    website: "http://www.github.com",
    twitter: "ethan",
    private: false,
    admins: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"],
    moderators: ["0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2"],
    members: [],
    categories: ["service"],
    labels: [],
    plugins: {},
    children: [],
    voting: { quorum: 0, hideAbstain: false },
    strategies: [
      {
        name: "erc20-balance-of",
        network: "11155111",
        params: {
          symbol: "OKB",
          address: "0x3F4B6664338F23d2397c953f2AB4Ce8031663f80",
          network: "11155111",
          decimals: 18,
        },
      },
    ],
    validation: { name: "any", params: {} },
    voteValidation: { name: "any", params: {} },
    filters: { minScore: 0, onlyMembers: true },
    treasuries: [],
    boost: { enabled: true, bribeEnabled: false },
  };

  // TODO: signCreateOrUpdateSpace
  // await signClient.signCreateOrUpdateSpace(
  //   web3Provider,
  //   account,
  //   "ethan.osp",
  //   settings_json
  // );

  const timestamp = Math.floor(Date.now() / 1e3);
  const proposal_message: Proposal = {
    space: "ethan.osp",
    type: "single-choice",
    title: "Test Proposal_" + timestamp,
    body: "This is a test proposal body",
    discussion: "",
    choices: ["Choice 1", "Choice 2", "Choice 3", "Choice 4"],
    labels: [],
    start: timestamp,
    end: timestamp + 6000,
    snapshot: 7073819,
    plugins: JSON.stringify({}),
    app: "ops_snapshot",
    timestamp: timestamp,
  };

  // TODO: signCreateProposal
  // await signClient.signCreateProposal(
  //   web3Provider,
  //   account,
  //   proposal_message
  // );

  // TODO: signDeleteProposal
  // await signClient.signDeleteProposal(
  //   web3Provider,
  //   account,
  //   "ethan.osp",
  //   "0xc7c59cc9e3ecc497a856b09ca88ba2b8ef1bf3131d5477d0b5a12c1ea93390f4"
  // );

  const vote_message: Vote = {
    space: "ethan.osp",
    proposal:
      "0x190df1dbc7049eefc24e7e789fca68335a54ea1d9451dd0f07aa72cb25ea6322",
    type: "single-choice",
    choice: 3,
    app: "ops_snapshot",
    reason: "like 3",
  };

  // TODO: signVote
  // await signClient.signCreateOrUpdateVote(web3Provider, account, vote_message);

  const randomWallet = Wallet.createRandom();

  // TODO: signSetAlias
  // await signClient.signSetAlias(web3Provider, account, randomWallet.address);

  await signClient.refreshProposalScores(
    "0xcb3b86050bf255ba88893c633ee80f6abbf3dae30e49705f03edffcb6819c312"
  );

  // await signClient.signFollowSpace(
  //   web3Provider,
  //   account,
  //   "ethan.osp",
  //   FollowType.UNFOLLOW
  // );
}

main();
