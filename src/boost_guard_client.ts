import {
  BoostRewardGuard,
  BoostSubgraph,
  BoostVoucherGuard,
  BoostWinnersGuard
} from "./utils/boost_types";
import { fetchRequest } from "./utils/util";

export class BoostGuardClient {
  private GUARD_URL: string;
  constructor(GUARD_URL: string) {
    this.GUARD_URL = GUARD_URL;
  }

  /**
   * Get the address of the guard claim signer
   * @returns string
   */
  async getGuardAddress(): Promise<string> {
    try {
      const result = await fetchRequest(this.GUARD_URL);
      return result.guard_address;
    } catch (error) {
      console.log("error:", error);
      return null;
    }
  }

  /**
   * Get the rewards of boosts for a proposal
   * @param proposalId
   * @param voter
   * @param boosts
   * @returns BoostRewardGuard[]
   */
  async getRewards(
    proposalId: string,
    voter: string,
    boosts: BoostSubgraph[]
  ): Promise<BoostRewardGuard[]> {
    const init: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        proposal_id: proposalId,
        voter_address: voter,
        boosts: boosts.map((boost) => [boost.id, boost.chainId])
      })
    };
    const result = await fetchRequest(`${this.GUARD_URL}/get-rewards`, init);
    return result;
  }

  /**
   * Get the winners of a boost [only lottery boost]
   * @param proposalId
   * @param boostId
   * @param chainId
   * @returns BoostWinnersGuard
   */
  async getWinners(
    proposalId: string,
    boostId: string,
    chainId: string
  ): Promise<BoostWinnersGuard> {
    const init: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        proposal_id: proposalId,
        boost_id: boostId,
        chain_id: chainId
      })
    };
    const result = await fetchRequest(
      `${this.GUARD_URL}/get-lottery-winners`,
      init
    );
    return result;
  }

  /**
   * Get vouchers for a proposal
   * @param proposalId
   * @param voter
   * @param boosts
   * @returns BoostVoucherGuard[]
   */
  async getVouchers(
    proposalId: string,
    voter: string,
    boosts: BoostSubgraph[]
  ): Promise<BoostVoucherGuard[]> {
    const init: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        proposal_id: proposalId,
        voter_address: voter,
        boosts: boosts.map((boost) => [boost.id, boost.chainId])
      })
    };
    const result = await fetchRequest(
      `${this.GUARD_URL}/create-vouchers`,
      init
    );

    return result;
  }
}
