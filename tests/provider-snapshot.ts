import {
  JsonRpcBatchProvider,
  StaticJsonRpcProvider,
} from "@ethersproject/providers";
import { ProviderOptions } from "@snapshot-labs/snapshot.js/dist/src/utils/provider";

const DEFAULT_BROVIDER_URL = "https://rpc.snapshot.org";

function getProvider(
  network: any,
  { broviderUrl = DEFAULT_BROVIDER_URL }: ProviderOptions = {}
) {
  const url = `${broviderUrl}/${network}`;
  if (network === "0") return new JsonRpcBatchProvider(broviderUrl);

  const provider = new StaticJsonRpcProvider(
    {
      url,
      timeout: 25000,
      allowGzip: true,
    },
    Number(network)
  );
  return provider;
}

async function main() {
  console.log("running");
  


  const provider = getProvider("11155111");
  const address = await provider.getSigner().getAddress();
  console.log(address);
  console.log(await provider.getBlockNumber());

  // https://eth-sepolia.g.alchemy.com/v2/cylP6mC72Z7Nv-k3FehuXverOVumN-j2
  const provider2 = getProvider("0", {
    broviderUrl:
      "https://eth-sepolia.g.alchemy.com/v2/cylP6mC72Z7Nv-k3FehuXverOVumN-j2",
  });
  console.log(await provider2.getBlockNumber());
}

main();
