import { Proposal, Vote } from "@snapshot-labs/snapshot.js/src/sign/types";
import { Wallet } from "@ethersproject/wallet";
import { FollowType, SnapShotSignClient } from "../src";

const web3Provider = new Wallet(process.env.PRIVATE_KEY_SIGNATURE!);
const account = web3Provider.address;
console.log(account);
console.log(web3Provider.provider);

async function main() {
  const sequencerUrl = "http://localhost:3001";
  const signClient = new SnapShotSignClient(
    sequencerUrl,
    "osp_snapshot_apiKey"
  );

  // TODO: signDeleteProposal
  // await signClient.signDeleteProposal(
  //   web3Provider,
  //   account,
  //   "ethan.osp",
  //   "0xc7c59cc9e3ecc497a856b09ca88ba2b8ef1bf3131d5477d0b5a12c1ea93390f4"
  // );

  const randomWallet = Wallet.createRandom();

  // TODO: signSetAlias
  // await signClient.signSetAlias(web3Provider, account, randomWallet.address);

  // await signClient.refreshProposalScores(
  //   "0xcb3b86050bf255ba88893c633ee80f6abbf3dae30e49705f03edffcb6819c312"
  // );

  await signClient.flagOperation(
    {
      type: "space",
      action: "verify",
      value: "ethan.osp"
    },
    "osp"
  );
  // const ipfs = await pinGraph({ hello: "world" });
  // console.log(ipfs.cid);
}

main();
