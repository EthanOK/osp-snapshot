import { create } from "ipfs-http-client";

const client = create({
  url: "https://api.thegraph.com/ipfs/api/v0"
});

export async function pinGraph(data: any) {
  const res = await client.add(JSON.stringify(data), { pin: true });

  return {
    provider: "graph",
    cid: res.cid.toV0().toString()
  };
}
