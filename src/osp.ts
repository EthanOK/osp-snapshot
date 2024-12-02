interface AccountDatas {
  [key: string]: Array<{
    network: string;
    bindEOA: string;
    abstractAccount: string;
  }>;
}

const account_datas: AccountDatas = {
  '0x962856974c9b5c1be77a48012f41ca34f89dade6': [
    {
      network: '204',
      bindEOA: '0x000000B1cf3c8Df89d748DcBEA3C970E1bcf4039',
      abstractAccount: '0xeb81272ADf2Cdc9620eF2eE8B237497917FaA56d'
    }
  ],
  '0xd8f176Ac53dBb3134179193534f9AFe3c037dD6c': [
    {
      network: '8453',
      bindEOA: '0x000000B1cf3c8Df89d748DcBEA3C970E1bcf4039',
      abstractAccount: '0xb4e5b30e0d0448173f27ab65a39fe1f3d6929e78'
    }
  ]
};

export const getOspBindEOAByWeb3auth = async (web3authAccount: string, network: string) => {
  const searchKey = web3authAccount.toLowerCase();
  const matchingKey = Object.keys(account_datas).find(key => key.toLowerCase() === searchKey);
  if (matchingKey) {
    const accountData = account_datas[matchingKey];
    const account = accountData.find(data => data.network === network);
    if (account) {
      return account.bindEOA;
    }
  }
  return null;
};

export const getOspAAccountByWeb3auth = async (web3authAccount: string, network: string) => {
  const searchKey = web3authAccount.toLowerCase();
  const matchingKey = Object.keys(account_datas).find(key => key.toLowerCase() === searchKey);
  if (matchingKey) {
    const accountData = account_datas[matchingKey];
    const account = accountData.find(data => data.network === network);
    if (account) {
      return account.abstractAccount;
    }
  }
  return null;
};

export const getOspAccounts = async (web3authAccount: string, network: string) => {
  const searchKey = web3authAccount.toLowerCase();
  const matchingKey = Object.keys(account_datas).find(key => key.toLowerCase() === searchKey);
  if (matchingKey) {
    const accountData = account_datas[matchingKey];
    const account = accountData.find(data => data.network === network);
    if (account) {
      return account;
    }
  }
  return null;
};

export const validateOspHandle = async (account: string, handle: string, network: string) => {
  // TODO: validate space
  // const account0 = await getAccountByHandle(handle, network);
  // return account0.toLowerCase() === account.toLowerCase();
  if (handle.endsWith('osp')) {
    return true;
  }
  return false;
};
