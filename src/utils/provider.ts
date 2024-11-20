import snapshot from "@snapshot-labs/snapshot.js";

export function getProvider(network: any, broviderUrl?: string) {
    return snapshot.utils.getProvider(network, { broviderUrl });
  }
  
  export async function getBlockNumber(network: any, broviderUrl?: string) {
    const provider = snapshot.utils.getProvider(network, { broviderUrl });
    return await provider.getBlockNumber();
  }