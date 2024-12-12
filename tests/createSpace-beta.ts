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
    name: "Beta.Somon.OSP",
    network: "84532",
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
        network: "84532",
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
              address: "0x0000002c5277aC4cD556FBd25aeeC1e2e472a233"
            },
            network: "84532"
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
              address: "0x0000002c5277aC4cD556FBd25aeeC1e2e472a233"
            },
            network: "84532"
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
    "beta.somon.official.osp",
    settings_json
  );
  if (response.code === 200) {
    console.log("Beta Somon CreateSpace Success");
  } else {
    console.error("CreateSpace Failed:", response.error);
  }
}

createOSPSpace();
