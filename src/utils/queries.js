"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEADERBOARD_QUERY = exports.SPACE_QUERY = exports.STATEMENTS_QUERY = exports.SPACES_QUERY = exports.SPACES_RANKING_QUERY = exports.USER_VOTED_PROPOSAL_IDS_QUERY = exports.PROFILES_QUERY = exports.ACTIVITY_VOTES_QUERY = exports.EXTENDED_STRATEGY_QUERY = exports.STRATEGIES_QUERY = exports.VALIDATIONS_COUNT_QUERY = exports.PLUGINS_COUNT_QUERY = exports.NETWORKS_COUNT_QUERY = exports.SKINS_COUNT_QUERY = exports.SPACE_DELEGATE_QUERY = exports.SPACE_SKIN_QUERY = exports.ENS_DOMAIN_BY_HASH_QUERY = exports.ENS_DOMAINS_BY_ACCOUNT_QUERY = exports.ALIASES_QUERY = exports.SUBSCRIPTIONS_QUERY = exports.FOLLOWS_QUERY = exports.NOTIFICATION_PROPOSALS_QUERY = exports.PROPOSALS_QUERY = exports.PROPOSAL_QUERY = exports.VOTES_QUERY = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
exports.VOTES_QUERY = (0, graphql_tag_1.default) `
  query Votes(
    $id: String!
    $first: Int
    $skip: Int
    $orderBy: String
    $orderDirection: OrderDirection
    $reason_not: String
    $voter: String
    $space: String
    $created_gte: Int
  ) {
    votes(
      first: $first
      skip: $skip
      where: {
        proposal: $id
        vp_gt: 0
        voter: $voter
        space: $space
        reason_not: $reason_not
        created_gte: $created_gte
      }
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      ipfs
      voter
      choice
      vp
      vp_by_strategy
      reason
      created
    }
  }
`;
exports.PROPOSAL_QUERY = (0, graphql_tag_1.default) `
  query Proposal($id: String!) {
    proposal(id: $id) {
      id
      ipfs
      title
      body
      discussion
      choices
      labels
      start
      end
      snapshot
      state
      author
      created
      plugins
      network
      type
      quorum
      quorumType
      symbol
      privacy
      validation {
        name
        params
      }
      strategies {
        name
        network
        params
      }
      space {
        id
        name
      }
      scores_state
      scores
      scores_by_strategy
      scores_total
      votes
      flagged
    }
  }
`;
exports.PROPOSALS_QUERY = (0, graphql_tag_1.default) `
  query Proposals(
    $first: Int!
    $skip: Int!
    $state: String!
    $space: String
    $space_in: [String]
    $author_in: [String]
    $title_contains: String
    $space_verified: Boolean
    $flagged: Boolean
  ) {
    proposals(
      first: $first
      skip: $skip
      where: {
        space: $space
        state: $state
        space_in: $space_in
        author_in: $author_in
        title_contains: $title_contains
        space_verified: $space_verified
        flagged: $flagged
      }
    ) {
      id
      ipfs
      title
      body
      start
      end
      state
      author
      created
      choices
      space {
        id
        name
        members
        avatar
        symbol
        verified
        turbo
        plugins
      }
      scores_state
      scores_total
      scores
      votes
      quorum
      quorumType
      symbol
      flagged
    }
  }
`;
exports.NOTIFICATION_PROPOSALS_QUERY = (0, graphql_tag_1.default) `
  query Proposals(
    $first: Int!
    $state: String!
    $space_in: [String]
    $start_gte: Int
  ) {
    proposals(
      first: $first
      where: { state: $state, space_in: $space_in, start_gte: $start_gte }
    ) {
      id
      title
      start
      end
      state
      space {
        id
        name
        avatar
      }
    }
  }
`;
exports.FOLLOWS_QUERY = (0, graphql_tag_1.default) `
  query Follows($space_in: [String], $follower_in: [String]) {
    follows(
      where: { space_in: $space_in, follower_in: $follower_in }
      first: 500
    ) {
      id
      follower
      space {
        id
      }
    }
  }
`;
exports.SUBSCRIPTIONS_QUERY = (0, graphql_tag_1.default) `
  query Subscriptions($space: String, $address: String) {
    subscriptions(where: { space: $space, address: $address }) {
      id
      address
      space {
        id
      }
    }
  }
`;
exports.ALIASES_QUERY = (0, graphql_tag_1.default) `
  query Aliases($address: String!, $alias: String!, $created_gt: Int) {
    aliases(
      where: { address: $address, alias: $alias, created_gt: $created_gt }
    ) {
      address
      alias
    }
  }
`;
exports.ENS_DOMAINS_BY_ACCOUNT_QUERY = (0, graphql_tag_1.default) `
  query Domain($id: String!) {
    account(id: $id) {
      domains {
        name
        expiryDate
      }
      wrappedDomains {
        name
        expiryDate
      }
    }
  }
`;
exports.ENS_DOMAIN_BY_HASH_QUERY = (0, graphql_tag_1.default) `
  query Registration($id: String!) {
    registration(id: $id) {
      domain {
        name
        labelName
      }
    }
  }
`;
exports.SPACE_SKIN_QUERY = (0, graphql_tag_1.default) `
  query Space($id: String!) {
    space(id: $id) {
      skin
    }
  }
`;
exports.SPACE_DELEGATE_QUERY = (0, graphql_tag_1.default) `
  query Space($id: String!) {
    space(id: $id) {
      id
      symbol
      network
      strategies {
        name
        network
        params
      }
    }
  }
`;
exports.SKINS_COUNT_QUERY = (0, graphql_tag_1.default) `
  query Skins {
    skins {
      id
      spacesCount
    }
  }
`;
exports.NETWORKS_COUNT_QUERY = (0, graphql_tag_1.default) `
  query Networks {
    networks {
      id
      spacesCount
    }
  }
`;
exports.PLUGINS_COUNT_QUERY = (0, graphql_tag_1.default) `
  query Plugins {
    plugins {
      id
      spacesCount
    }
  }
`;
exports.VALIDATIONS_COUNT_QUERY = (0, graphql_tag_1.default) `
  query Validations {
    validations {
      id
      spacesCount
    }
  }
`;
exports.STRATEGIES_QUERY = (0, graphql_tag_1.default) `
  query Strategies {
    strategies {
      id
      author
      version
      spacesCount
    }
  }
`;
exports.EXTENDED_STRATEGY_QUERY = (0, graphql_tag_1.default) `
  query Strategy($id: String!) {
    strategy(id: $id) {
      id
      author
      version
      spacesCount
      about
      schema
      examples
    }
  }
`;
exports.ACTIVITY_VOTES_QUERY = (0, graphql_tag_1.default) `
  query Votes(
    $voter: String!
    $first: Int
    $skip: Int
    $orderBy: String
    $orderDirection: OrderDirection
  ) {
    votes(
      first: $first
      skip: $skip
      where: { voter: $voter }
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      created
      choice
      proposal {
        id
        title
        choices
        type
      }
      space {
        id
        avatar
      }
    }
  }
`;
exports.PROFILES_QUERY = (0, graphql_tag_1.default) `
  query Users($addresses: [String]!, $first: Int, $skip: Int) {
    users(first: $first, skip: $skip, where: { id_in: $addresses }) {
      id
      name
      about
      avatar
      created
    }
  }
`;
exports.USER_VOTED_PROPOSAL_IDS_QUERY = (0, graphql_tag_1.default) `
  query Votes($voter: String!, $proposals: [String]!) {
    votes(first: 1000, where: { voter: $voter, proposal_in: $proposals }) {
      proposal {
        id
      }
    }
  }
`;
exports.SPACES_RANKING_QUERY = (0, graphql_tag_1.default) `
  query Ranking(
    $first: Int
    $skip: Int
    $search: String
    $network: String
    $category: String
  ) {
    ranking(
      first: $first
      skip: $skip
      where: { search: $search, network: $network, category: $category }
    ) {
      metrics {
        total
        categories
      }
      items {
        id
        name
        avatar
        private
        verified
        turbo
        categories
        rank
        activeProposals
        proposalsCount
        proposalsCount7d
        followersCount
        followersCount7d
        votesCount
        votesCount7d
        terms
      }
    }
  }
`;
exports.SPACES_QUERY = (0, graphql_tag_1.default) `
  query Spaces($id_in: [String], $first: Int, $skip: Int) {
    spaces(first: $first, skip: $skip, where: { id_in: $id_in }) {
      id
      name
      avatar
      verified
      turbo
      activeProposals
      followersCount
      terms
      flagged
      hibernated
    }
  }
`;
exports.STATEMENTS_QUERY = (0, graphql_tag_1.default) `
  query Statements($space: String!, $delegate_in: [String]!) {
    statements(where: { space: $space, delegate_in: $delegate_in }) {
      delegate
      space
      statement
      about
      ipfs
      id
      discourse
      network
      status
    }
  }
`;
exports.SPACE_QUERY = (0, graphql_tag_1.default) `
  query Space($id: String!) {
    space(id: $id) {
      id
      name
      about
      network
      symbol
      network
      terms
      skin
      avatar
      twitter
      website
      github
      coingecko
      private
      domain
      admins
      moderators
      members
      categories
      labels {
        id
        name
        description
        color
      }
      plugins
      followersCount
      template
      guidelines
      verified
      turbo
      flagged
      hibernated
      parent {
        id
        name
        avatar
        followersCount
        children {
          id
        }
      }
      children {
        id
        name
        avatar
        followersCount
        parent {
          id
        }
      }
      voting {
        delay
        period
        type
        quorum
        quorumType
        privacy
        hideAbstain
      }
      strategies {
        name
        network
        params
      }
      validation {
        name
        params
      }
      voteValidation {
        name
        params
      }
      filters {
        minScore
        onlyMembers
      }
      delegationPortal {
        delegationType
        delegationContract
        delegationNetwork
        delegationApi
      }
      treasuries {
        name
        address
        network
      }
      boost {
        enabled
        bribeEnabled
      }
    }
  }
`;
exports.LEADERBOARD_QUERY = (0, graphql_tag_1.default) `
  query Leaderboard($space: String!, $user_in: [String]) {
    leaderboards(where: { space: $space, user_in: $user_in }) {
      space
      user
      proposalsCount
      votesCount
      lastVote
    }
  }
`;
