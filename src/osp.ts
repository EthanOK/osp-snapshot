import snapshot from '@snapshot-labs/snapshot.js';
import redisClient from './helpers/redis';
import { Contract } from '@ethersproject/contracts';
import log from './helpers/log';
import { addOrUpdateSpace } from './helpers/actions';

const broviderUrl = process.env.BROVIDER_URL || 'https://rpc.snapshot.org';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const OSP_CHAIN_IDS = ['8453', '204'];

export const OSPContractMap = {
  dev: '0x0000005d520C83F6A87b4AaF62872566c3509C2C',
  beta: '0x0000002c5277aC4cD556FBd25aeeC1e2e472a233',
  pre: '0x000000b34357bd749731F3fAaf0971DC3A0571D7',
  prod: '0x00000066C6C6fCa286F48A7f4E989b7198c26cAf'
};

export const OSPTribeContractMap = {
  dev: '0x00000062954A785b82fb182D289987bDf29389Ab',
  beta: '0x000000CBBAAB23381b8a96eA51538bB14B4064cf',
  pre: '0x0000001B66F42B5797dCE3A44b285813ea53cA88',
  prod: '0x000000cb792aB2993998DB8C1aB2603FB436FAA0'
};

/**
 * Validates the format of a given OSP space ID.
 *
 * The space ID should follow the format:
 * - "dev.<number>.<number>.osp", "beta.<number>.<number>.osp", or "pre.<number>.<number>.osp"
 * - "<number>.osp"
 *
 * @param spaceId - The space ID to validate.
 * @returns A promise that rejects with an error message if the space ID is invalid.
 */

const validateSpaceId = (spaceId: string, contractMap: any) => {
  const regex = /^((dev|beta|pre)\.\d+\.\d+|\d+(.\d+)?)\.osp$/;
  if (!regex.test(spaceId)) {
    return Promise.reject('Invalid OSP Space Id');
  }
  const parts = spaceId.split('.');
  const prefix = parts[0];
  let contract = '';
  let tribeId = '';
  let chainId = '';
  if (parts.length === 4 && prefix in contractMap) {
    tribeId = parts[1];
    chainId = parts[2];
    contract = contractMap[prefix];
  } else if (parts.length === 3) {
    tribeId = parts[0];
    chainId = parts[1];
    if (!OSP_CHAIN_IDS.includes(chainId)) {
      return Promise.reject('Invalid Chain Id');
    }
    contract = contractMap.prod;
  }

  return { tribeId, chainId, contract };
};

export const getOspJoinNFT = async (spaceId: string) => {
  const { tribeId, chainId, contract } = await validateSpaceId(spaceId, OSPContractMap);
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

export const getOspSpaceOwner = async (spaceId: string) => {
  const { tribeId, chainId, contract } = await validateSpaceId(spaceId, OSPTribeContractMap);
  if (!tribeId || !chainId || !contract) {
    return Promise.reject('Invalid input parameters');
  }
  const tribeOwner = await getTribeOwner(tribeId, chainId, contract);
  return tribeOwner;
};
const getJoinContractAddress = async (tribeId: string, chainId: string, contract: string) => {
  try {
    const ospABI = ['function getJoinNFT(uint256 communityId) view returns (address)'];
    const provider = snapshot.utils.getProvider(chainId, { broviderUrl });
    const ospContract = new Contract(contract, ospABI, provider);
    const result = await ospContract.getJoinNFT(tribeId);
    return result as string;
  } catch (error) {
   log.warn('getJoinContractAddress error');
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
    return Promise.reject('failed create space');
  }
  log.info(`[createOspSpace] spaceId: ${spaceId}`);
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

export const getTribeOwner = async (tribeId: string, chainId: string, contract: string) => {
  try {
    const tribeABI = ['function ownerOf(uint256 tokenId) view returns (address)'];
    const provider = snapshot.utils.getProvider(chainId, { broviderUrl });
    const ospContract = new Contract(contract, tribeABI, provider);
    const result = await ospContract.ownerOf(tribeId);
    return result as string;
  } catch (error) {
    log.warn('getTribeOwner error');
    return ZERO_ADDRESS;
  }
};

// getOspJoinNFT('beta.69.84532.osp').then(console.log);

// getOspSpaceOwner('beta.395.84532.osp').then(console.log);
