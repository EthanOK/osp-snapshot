import { Wallet } from "@ethersproject/wallet";
import { SnapShotSignClient } from "../src";
import dotenv from "dotenv";
import { sequencerUrl } from "./config";
dotenv.config();

const spaceOwner_provider = new Wallet(process.env.PRIVATE_KEY_SIGNATURE!);
const spaceOwner = spaceOwner_provider.address;

const signClient = new SnapShotSignClient(
  sequencerUrl,
  // "http://localhost:3001",
  "osp_snapshot_apiKey"
);

async function createOSPSpace() {
  const settings_json = {
    name: "SOMON.OSP",
    network: "8453",
    symbol: "Ticket",
    twitter: "somon",
    website: "https://m.social.monster",
    private: false,
    admins: ["0x6278a1e803a76796a3a1f7f6344fe874ebfe94b2"],
    moderators: [],
    members: [],
    categories: ["service"],
    labels: [],
    plugins: {},
    children: [],
    voting: {
      hideAbstain: false
    },
    strategies: [
      {
        name: "ticket",
        network: "8453",
        params: {
          value: 1,
          symbol: "Ticket"
        }
      }
    ],
    validation: {
      name: "basic",
      params: {
        minScore: 1,
        strategies: [
          {
            name: "erc721",
            params: {
              symbol: "OSPP",
              address: "0x00000066C6C6fCa286F48A7f4E989b7198c26cAf"
            },
            network: "8453"
          }
        ]
      }
    },
    voteValidation: {
      name: "basic",
      params: {
        minScore: 1,
        strategies: [
          {
            name: "erc721",
            params: {
              symbol: "OSPP",
              address: "0x00000066C6C6fCa286F48A7f4E989b7198c26cAf"
            },
            network: "8453"
          }
        ]
      }
    },
    filters: {
      minScore: 0,
      onlyMembers: false
    },
    treasuries: [],
    boost: {
      enabled: true,
      bribeEnabled: false
    }
  };

  const response = await signClient.signCreateOrUpdateSpace(
    spaceOwner_provider,
    spaceOwner,
    "somon.official.osp",
    settings_json
  );
  if (response.code === 200) {
    console.log("CreateSpace Success");
  } else {
    console.error("CreateSpace Failed:", response.error);
  }
}

createOSPSpace();
