import { Wallet } from "@ethersproject/wallet";
import dotenv from "dotenv";
import { OSPWallet } from "./ospWallet";
dotenv.config();

// export const sequencerUrl = "http://localhost:3001";
export const sequencerUrl = "https://snapshot-sequencer.trex.xyz";
// export const hubUrl = "http://localhost:3000";
export const hubUrl = "https://snapshot-hub.trex.xyz";
export const scoreApiUrl = "https://score-api.trex.xyz";

// BETA_SOMON_PRIVATE_KEY PROD_SOMON_PRIVATE_KEY
export const osp_wallet = new OSPWallet(
  new Wallet(process.env.BETA_SOMON_PRIVATE_KEY!)
);
// BETA_SOMON_AA PROD_SOMON_AA
export const osp_aa = process.env.BETA_SOMON_AA!;
// BETA_SOMON_SPACE_ID PROD_SOMON_SPACE_ID
export const osp_spaceId = process.env.BETA_SOMON_SPACE_ID!;

export const osp_secret = process.env.FLAG_SPACE_SECRET;
