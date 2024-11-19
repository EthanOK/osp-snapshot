import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
  gql,
} from "@apollo/client/core";
import { cloneDeep } from "@apollo/client/utilities";
import {
  ACTIVITY_VOTES_QUERY,
  ALIASES_QUERY,
  FOLLOWS_QUERY,
  PROPOSAL_QUERY,
  PROPOSALS_QUERY,
  SPACE_QUERY,
  SPACES_RANKING_QUERY,
  VOTES_QUERY,
} from "./utils/queries";

export enum ProposalState {
  ALL = "all",
  ACTIVE = "active",
  PENDING = "pending",
  CLOSED = "closed",
}

/**
 * Query spaces ranking params
 * @param search
 * @param network
 * @param category
 */
export interface QuerySpacesRankingsParams {
  search?: string;
  network?: string;
  category?: string;
}

/**
 * Query proposal params
 * @param spaceIds
 * @param state
 * @param first
 * @param title_contains
 */
export interface QueryProposalParam {
  spaceIds: string[];
  state: ProposalState;
  first?: number;
  title_contains?: string;
}

/**
 * Query votes params
 * @param proposalId
 * @param first
 * @param orderDirection
 * @param onlyWithReason
 * @param voter
 */
export interface QueryVotesParam {
  proposalId: string;
  first?: number;
  orderDirection?: "asc" | "desc";
  onlyWithReason?: string;
  voter?: string;
}

/**
 * GraphQL client
 */
export class SnapShotGraphQLClient {
  apolloClient: ApolloClient<NormalizedCacheObject>;

/**
 * Initialize client
 * @param hubUrl
 * @param apiKey
 */
  constructor(hubUrl: string, apiKey?: string) {
    this.apolloClient = new ApolloClient({
      uri: `${hubUrl}/graphql?${apiKey ? `apiKey=${apiKey}` : ""}`,
      cache: new InMemoryCache({
        addTypename: false,
      }),
      defaultOptions: {
        query: {
          fetchPolicy: "no-cache",
        },
      },
      typeDefs: gql`
        enum OrderDirection {
          asc
          desc
        }
      `,
    });
  }

  async apolloQuery(options: any, path = ""): Promise<any> {
    try {
      const response = await this.apolloClient.query(options);
      return cloneDeep(!path ? response.data : response.data[path]);
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  /**
   * Query spaces ranking
   * @param params
   * @param skip
   * @returns
   */
  async querySpacesRankings(params: QuerySpacesRankingsParams = {}, skip = 0) {
    return await this.apolloQuery(
      {
        query: SPACES_RANKING_QUERY,
        variables: {
          skip: skip,
          first: 12,
          private: false,
          search: params.search || undefined,
          network: params.network || undefined,
          category: params.category || undefined,
        },
      },
      "ranking"
    );
  }

  /**
   * Query space by id
   * @param spaceId
   * @returns
   */
  async querySpace(spaceId: string) {
    return await this.apolloQuery(
      {
        query: SPACE_QUERY,
        variables: {
          id: spaceId,
        },
      },
      "space"
    );
  }

  /**
   * Query proposals
   * @param params
   * @param skip
   * @returns
   */
  async queryProposals(params: QueryProposalParam, skip = 0) {
    return await this.apolloQuery(
      {
        query: PROPOSALS_QUERY,
        variables: {
          first: params.first || 6,
          skip,
          space_in: params.spaceIds,
          state: params.state,
          title_contains: params.title_contains,
          flagged: false,
        },
      },
      "proposals"
    );
  }

  /**
   * Query proposal by id
   * @param proposalId
   * @returns
   */
  async queryProposal(proposalId: string) {
    return await this.apolloQuery(
      {
        query: PROPOSAL_QUERY,
        variables: {
          id: proposalId,
        },
      },
      "proposal"
    );
  }

  /**
   * Query votes by proposal id
   * @param queryParams
   * @param skip
   * @returns
   */
  async queryVotesByProposalId(queryParams: QueryVotesParam, skip = 0) {
    return await this.apolloQuery(
      {
        query: VOTES_QUERY,
        variables: {
          id: queryParams.proposalId,
          first: queryParams.first || 6,
          skip,
          orderBy: "vp",
          orderDirection: queryParams.orderDirection || "desc",
          reason_not: queryParams.onlyWithReason ? "" : undefined,
          voter: queryParams.voter || undefined,
        },
      },
      "votes"
    );
  }

  /**
   * Query votes by voter
   * @param voter
   * @param first
   * @param skip
   * @returns
   */
  async queryVotesByVoter(voter: string, first = 20, skip = 0) {
    return await this.apolloQuery(
      {
        query: ACTIVITY_VOTES_QUERY,
        variables: {
          first,
          skip,
          voter: voter,
        },
      },
      "votes"
    );
  }

  /**
   * Query aliases
   * @param account
   * @param alias
   * @returns
   */
  async queryAliases(account: string, alias: string) {
    return await this.apolloQuery(
      {
        query: ALIASES_QUERY,
        variables: {
          address: account,
          alias: alias,
          created_gt: Math.floor(Date.now() / 1000) - 30 * 60 * 60 * 24,
        },
      },
      "aliases"
    );
  }

  /**
   * Query follows
   * @param account
   * @param spaceId
   * @returns
   */
  async queryFollowSpace(account: string, spaceId?: string) {
    return await this.apolloQuery(
      {
        query: FOLLOWS_QUERY,
        variables: {
          follower_in: account,
          space_in: spaceId ? [spaceId] : undefined,
        },
      },
      "follows"
    );
  }
}
