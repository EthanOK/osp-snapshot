export interface ISigner {
  getAddress(): Promise<string>;
  signMessage(
    message: ArrayLike<number> | string,
    options?: {
      verificationContract?: string;
    }
  ): Promise<string>;
  signTypedData(
    domain: any,
    types: Record<string, Array<any>>,
    value: Record<string, any>,
    options?: {
      verificationContract?: string;
    }
  ): Promise<string>;
}
