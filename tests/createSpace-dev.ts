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
  // create somon space
  const settings_json_somon = {
    name: "Dev.Somon.OSP",
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
              address: "0x0000005d520C83F6A87b4AaF62872566c3509C2C"
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
              address: "0x0000005d520C83F6A87b4AaF62872566c3509C2C"
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
  const response_somon = await signClient.signCreateOrUpdateSpace(
    spaceOwner_provider,
    spaceOwner,
    "dev.somon.official.osp",
    settings_json_somon
  );
  if (response_somon.code === 200) {
    console.log("Dev Somon CreateSpace Success");
  } else {
    console.error("CreateSpace Failed:", response_somon.error);
  }
  return;
  // create butter space
  const settings_json_butter = {
    name: "Dev.Butter.OSP",
    network: "5611",
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
        network: "5611",
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
              address: "0x0000005d520C83F6A87b4AaF62872566c3509C2C"
            },
            network: "5611"
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
              address: "0x0000005d520C83F6A87b4AaF62872566c3509C2C"
            },
            network: "5611"
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
  const response_butter = await signClient.signCreateOrUpdateSpace(
    spaceOwner_provider,
    spaceOwner,
    "dev.butter.official.osp",
    settings_json_butter
  );
  if (response_butter.code === 200) {
    console.log("Dev Butter CreateSpace Success");
  } else {
    console.error("CreateSpace Failed:", response_butter.error);
  }
}

createOSPSpace();
