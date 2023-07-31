"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeDefs = `
type Team {
  teamId: Int!
  teamName: String!
  teamSName: String!
  imageId: Int!
}

type VenueInfo {
  ground: String!
  city: String!
  country: String
  timezone: String!
}

type Match {
  matchId: Int! 
  seriesId: Int!
  matchDesc: String!
  matchFormat: String!
  team1: Team!
  team2: Team!
  startDate: String!
  endDate: String!
  seriesStartDt: String!
  seriesEndDt: String!
  venueInfo: VenueInfo!
}

type Query {
  upcomingMatches: [Match!]!
}

type Mutation {
  updateTeams: [Team!]!
  updateUpcomingMatches: [Match!]!
}
`;
exports.default = typeDefs;
//# sourceMappingURL=upcomingMatchesSchema.js.map