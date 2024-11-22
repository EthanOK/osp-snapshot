import snapshot from "@snapshot-labs/snapshot.js";
import {
  BoostStrategy,
  BoostSubgraph,
  Distribution,
  Eligibility
} from "./utils/boost_types";
import { pinGraph } from "./utils/pin_graph";
import { TransactionResponse, Web3Provider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
import { parseEther } from "@ethersproject/units";
import { Wallet } from "@ethersproject/wallet";
import ABI from "./abi/boost_abi.json";
import { getProvider } from "./utils/provider";

// TODO: UBGRAPH_URLS
export const SUBGRAPH_URLS = {
  "1": "https://subgrapher.snapshot.org/subgraph/arbitrum/A6EEuSAB7mFrWvLBnL1HZXwfiGfqFYnFJjc14REtMNkd",
  "11155111":
    "https://subgrapher.snapshot.org/subgraph/arbitrum/6T64qrPe7S46zhArSoBF8CAmc5cG3PyKa92Nt4Jhymcy",
  "137":
    "https://subgrapher.snapshot.org/subgraph/arbitrum/CkNpf5gY7XPCinJWP1nh8K7u6faXwDjchGGV4P9rgJ7",
  "8453":
    "https://subgrapher.snapshot.org/subgraph/arbitrum/52uVpyUHkkMFieRk1khbdshUw26CNHWAEuqLojZzcyjd"
};

// TODO: BOOST_CONTRACTS
export const BOOST_CONTRACTS = {
  //   "1": "0x8E8913197114c911F13cfBfCBBD138C1DC74B964",
  "11155111": "0x8E8913197114c911F13cfBfCBBD138C1DC74B964",
  //   "137": "0x8E8913197114c911F13cfBfCBBD138C1DC74B964",
  "8453": "0x8E8913197114c911F13cfBfCBBD138C1DC74B964"
};

export const SUPPORTED_NETWORKS = Object.keys(BOOST_CONTRACTS);

export const TWO_WEEKS = 1209600;
export async function getBoosts(
  proposalIds: string[]
): Promise<BoostSubgraph[]> {
  async function query(chainId: string) {
    const data = await snapshot.utils.subgraphRequest(SUBGRAPH_URLS[chainId], {
      boosts: {
        __args: {
          where: { strategy_: { proposal_in: proposalIds } }
        },
        id: true,
        strategyURI: true,
        poolSize: true,
        guard: true,
        start: true,
        end: true,
        owner: true,
        currentBalance: true,
        transaction: true,
        token: {
          id: true,
          name: true,
          symbol: true,
          decimals: true
        },
        strategy: {
          id: true,
          name: true,
          version: true,
          proposal: true,
          eligibility: {
            type: true,
            choice: true
          },
          distribution: {
            type: true,
            limit: true,
            numWinners: true
          }
        }
      }
    });
    if (data?.boosts) {
      data.boosts = data.boosts.map((boost) => ({
        ...boost,
        chainId
      }));
    }
    return data;
  }
  const requests = SUPPORTED_NETWORKS.map((chainId) => query(chainId));
  const responses: { boosts: BoostSubgraph }[] = await Promise.all(requests);

  return responses
    .map((response) => response.boosts)
    .filter((boost) => boost)
    .flat();
}

export async function getStrategyURI(
  proposalId: string,
  eligibility: Eligibility,
  distribution: Distribution
): Promise<string> {
  if (eligibility.type == "bribe" && eligibility.choice == null) {
    console.error("Bribe strategy requires choice");
    return null;
  }

  switch (distribution.type) {
    case "lottery":
      if (
        distribution.numWinners == null ||
        Number(distribution.numWinners) < 1
      ) {
        console.error("Lottery strategy requires numWinners");
        return null;
      }
      if (
        distribution.limit != null &&
        (Number(distribution.limit) >= 10000 || Number(distribution.limit) <= 0)
      ) {
        console.error("Lottery strategy requires limit 0 < x < 10000");
        return null;
      }
      break;

    default:
      break;
  }

  // TODO BoostStrategy example
  const strategy: BoostStrategy = {
    name: "Boost",
    description: "OSP Snapshot proposal boost.",
    image: "https://snapshot.org/boost.png",
    external_url: `http://osp.snapshot.org/proposal/${proposalId}`,
    strategyName: "proposal",
    params: {
      version: "0.0.1",
      env: "snapshot",
      proposal: `${proposalId}`,
      eligibility: eligibility,
      distribution: distribution
    }
  };

  const ipfs = await pinGraph(strategy);
  return `ipfs://${ipfs.cid}`;
}

/**
 * Create a boost
 * @param web3Provider
 * @param networkId
 * @param ethFee
 * @param params
 */
export async function createBoost(
  web3Provider: Web3Provider | Wallet,
  networkId: string,
  ethFee: string,
  params: {
    strategyURI: string;
    token: string;
    amount: string;
    owner: string;
    guard: string;
    start: number;
    end: number;
  }
): Promise<TransactionResponse> {
  const { strategyURI, token, amount, guard, start, end, owner } = params;
  let signer: any;
  if (web3Provider instanceof Web3Provider) {
    signer = web3Provider.getSigner();
  } else {
    if (web3Provider.provider == null)
      signer = web3Provider.connect(getProvider(networkId));
    else signer = web3Provider;
  }
  const contract = new Contract(BOOST_CONTRACTS[networkId], ABI, signer);
  const options = { value: parseEther(ethFee) };
  return await contract.mint(
    strategyURI,
    token,
    amount,
    owner,
    guard,
    start,
    end,
    options
  );
}

/**
 * Claim tokens from a boost
 * @param web3Provider
 * @param networkId
 * @param boost
 * @param signature
 */
export async function claimTokens(
  web3Provider: Web3Provider | Wallet,
  networkId: string,
  boost: {
    boostId: string;
    recipient: string;
    amount: string;
  },
  signature: string
): Promise<TransactionResponse> {
  const { boostId, recipient, amount } = boost;
  let signer: any;
  if (web3Provider instanceof Web3Provider) {
    signer = web3Provider.getSigner();
  } else {
    if (web3Provider.provider == null)
      signer = web3Provider.connect(getProvider(networkId));
    else signer = web3Provider;
  }
  const contract = new Contract(BOOST_CONTRACTS[networkId], ABI, signer);
  return await contract.claim([boostId, recipient, amount], signature);
}
