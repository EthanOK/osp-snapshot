import hubDB from './helpers/mysql';

export const getOspBindEOAByWeb3auth = async (web3authAccount: string, network: string) => {
  const web3auth_eoa = web3authAccount.toLowerCase();
  try {
    const accounts = await hubDB.queryAsync(
      `SELECT * FROM web3auth WHERE web3auth_eoa = ? AND network = ?`,
      [web3auth_eoa, network]
    );
    if (accounts.length > 0) {
      return accounts[0].bind_eoa as string;
    }
  } catch (error) {}
  return null;
};

export const getOspAAccountByWeb3auth = async (web3authAccount: string, network: string) => {
  const web3auth_eoa = web3authAccount.toLowerCase();
  try {
    const accounts = await hubDB.queryAsync(
      `SELECT * FROM web3auth WHERE web3auth_eoa = ? AND network = ?`,
      [web3auth_eoa, network]
    );
    if (accounts.length > 0) {
      return accounts[0].aa as string;
    }
  } catch (error) {}

  return null;
};

export const getOspAccounts = async (web3authAccount: string, network: string) => {
  const web3auth_eoa = web3authAccount.toLowerCase();
  try {
    const accounts = await hubDB.queryAsync(
      `SELECT * FROM web3auth WHERE web3auth_eoa = ? AND network = ?`,
      [web3auth_eoa, network]
    );
    if (accounts.length > 0) {
      return {
        bindEOA: accounts[0].bind_eoa,
        abstractAccount: accounts[0].aa
      };
    }
  } catch (error) {}

  return null;
};

export const validateOspHandle = async (account: string, handle: string, network: string) => {
  // TODO: validate space

  try {
    const accounts = await hubDB.queryAsync(
      `SELECT * FROM osphandles WHERE handle = ? AND network = ?`,
      [handle, network]
    );
    if (accounts.length > 0) {
      return accounts[0].account.toLowerCase() === account.toLowerCase();
    }
  } catch (error) {}

  return false;
};
