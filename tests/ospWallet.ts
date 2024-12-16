import { Wallet } from "@ethersproject/wallet";
import { ISigner } from "../src/utils/osp_signer";

export class OSPWallet implements ISigner {
  wallet: Wallet;

  constructor(wallet: Wallet) {
    this.wallet = wallet;
  }
  async getAddress(): Promise<string> {
    return this.wallet.address;
  }
  async signMessage(message: string): Promise<string> {
    return this.wallet.signMessage(message);
  }
  async signTypedData(domain: any, types: any, value: any): Promise<string> {
    return this.wallet._signTypedData(domain, types, value);
  }
}
