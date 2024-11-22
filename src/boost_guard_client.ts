import { fetchRequest } from "./utils/util";

export class BoostGuardClient {
  private url: string;
  constructor(url: string) {
    this.url = url;
  }

  async getGuardAddress(): Promise<string> {
    try {
      const result = await fetchRequest(this.url);
      return result.guard_address;
    } catch (error) {
      console.log("error:", error);
      return null;
    }
  }
}
