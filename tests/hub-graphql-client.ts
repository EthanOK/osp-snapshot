import { SnapShotGraphQLClient } from "../src";

async function main() {
  const hub_URL = "http://localhost:3000";

  const queryClient = new SnapShotGraphQLClient(hub_URL, "osp_snapshot_apiKey");

  let data;

  try {
    for (let i = 0; i < 10; i++) {
      data = await queryClient.queryAliases(
        "0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2",
        "0x89581707e0368fAa5bbd3532981CAEdD40be7B44"
      );
      console.log(i);
    }
  } catch (error) {
    console.log(error);
  }

  // const fs = require("fs");
  // fs.writeFileSync("temp.json", JSON.stringify(data, null, 2));
}

main();
