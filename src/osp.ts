import hubDB from './helpers/mysql';

export const getOspBindEOAByAA = async (aa: string, network: string) => {
  try {
    const accounts = await hubDB.queryAsync(`SELECT * FROM aacounts WHERE aa = ? AND network = ?`, [
      aa.toLowerCase(),
      network
    ]);
    if (accounts.length > 0) {
      return accounts[0].bind_eoa as string;
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
