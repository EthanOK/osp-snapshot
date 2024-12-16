import snapshot from '@snapshot-labs/snapshot.js';
import redisClient from './helpers/redis';
import { Contract } from '@ethersproject/contracts';
import log from './helpers/log';
import { addOrUpdateSpace } from './helpers/actions';

const broviderUrl = process.env.BROVIDER_URL || 'https://rpc.snapshot.org';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const methodABI = {
  inputs: [
    {
      internalType: 'uint256',
      name: 'communityId',
      type: 'uint256'
    }
  ],
  name: 'getJoinNFT',
  outputs: [
    {
      internalType: 'address',
      name: '',
      type: 'address'
    }
  ],
  stateMutability: 'view',
  type: 'function'
};

export const OSP_CHAIN_IDS = ['8453', '204'];

export const OSPContractMap = {
  dev: '0x0000005d520C83F6A87b4AaF62872566c3509C2C',
  beta: '0x0000002c5277aC4cD556FBd25aeeC1e2e472a233',
  pre: '0x000000b34357bd749731F3fAaf0971DC3A0571D7',
  prod: '0x00000066C6C6fCa286F48A7f4E989b7198c26cAf'
};

// TODO: dev_1_1 or beta_1_1 or pre_1_1 or 1_1
/**
 *
 * @param spaceId
 * @returns
 */
export const getOspJoinNFT = async (spaceId: string) => {
  const regex = /^((dev|beta|pre)\.\d+\.\d+|\d+(.\d+)?)\.osp$/;
  if (!regex.test(spaceId)) {
    return Promise.reject('Invalid OSP Space Id');
  }
  const parts = spaceId.split('.');
  const prefix = parts[0];
  let contract = '';
  let tribeId = '';
  let chainId = '';
  if (parts.length === 4 && prefix in OSPContractMap) {
    tribeId = parts[1];
    chainId = parts[2];
    contract = OSPContractMap[prefix];
  } else if (parts.length === 3) {
    tribeId = parts[0];
    chainId = parts[1];
    if (!OSP_CHAIN_IDS.includes(chainId)) {
      return Promise.reject('Invalid Chain Id');
    }
    contract = OSPContractMap.prod;
  }

  if (!tribeId || !chainId || !contract) {
    return Promise.reject('Invalid input parameters');
  }

  const key = `osp:${tribeId}:${chainId}:${contract}`;
  log.info(`[getOspJoinNFT] key: ${key}`);
  if (redisClient?.isReady) {
    const ospJoinNFT = await redisClient.get(key);
    if (ospJoinNFT && ospJoinNFT !== ZERO_ADDRESS) {
      return {
        chainId,
        ospJoinNFT: ospJoinNFT as string
      };
    }
  }
  const ospJoinNFT = await getJoinContractAddress(tribeId, chainId, contract);
  if (redisClient?.isReady && ospJoinNFT !== ZERO_ADDRESS) {
    await redisClient.set(key, ospJoinNFT);
  }

  return {
    chainId,
    ospJoinNFT: ospJoinNFT
  };
};
const getJoinContractAddress = async (tribeId: string, chainId: string, contract: string) => {
  try {
    const provider = snapshot.utils.getProvider(chainId, { broviderUrl });
    const ospContract = new Contract(contract, [methodABI], provider);
    const result = await ospContract.getJoinNFT(tribeId);
    return result as string;
  } catch (error) {
    console.log('getJoinContractAddress', error);
    return ZERO_ADDRESS;
  }
};

export const createOspSpace = async (spaceId: string) => {
  const ospJoinNFT = await getOspJoinNFT(spaceId);
  if (ospJoinNFT.ospJoinNFT === ZERO_ADDRESS) {
    return Promise.reject('tribe not found');
  }
  const settings = await getOspSpaceSettings(spaceId, ospJoinNFT.ospJoinNFT, ospJoinNFT.chainId);
  try {
    await addOrUpdateSpace(spaceId, settings);
  } catch (e) {
    return Promise.reject("failed create space");
  }
  console.log("create osp space", spaceId);
  return;
};

export const getOspSpaceSettings = async (spaceId: string, ospJoinNFT: string, chainId: string) => {
  const settings = {
    name: spaceId.toUpperCase(),
    network: chainId,
    symbol: 'Ticket',
    twitter: '',
    website: '',
    private: false,
    admins: [],
    moderators: [],
    members: [],
    categories: ['service'],
    labels: [],
    plugins: {},
    children: [],
    voting: {
      hideAbstain: false
    },
    strategies: [
      {
        name: 'ticket',
        network: chainId,
        params: {
          value: 1,
          symbol: 'Ticket'
        }
      }
    ],
    validation: {
      name: 'basic',
      params: {
        minScore: 1,
        strategies: [
          {
            name: 'erc721',
            params: {
              symbol: 'OSPJ',
              address: ospJoinNFT
            },
            network: chainId
          }
        ]
      }
    },
    voteValidation: {
      name: 'basic',
      params: {
        minScore: 1,
        strategies: [
          {
            name: 'erc721',
            params: {
              symbol: 'OSPJ',
              address: ospJoinNFT
            },
            network: chainId
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

  return settings;
};

// getOspJoinNFT('dev_1_204').then(console.log);
