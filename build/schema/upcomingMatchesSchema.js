"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const graphql_1 = require("graphql");
// Custom scalar type for representing large integers
const GraphQLLong = new graphql_1.GraphQLScalarType({
    name: 'Long',
    description: 'Custom scalar type for representing large integers',
    serialize(value) {
        return String(value); // Convert the value to a string to preserve precision
    },
    parseValue(value) {
        return parseInt(value, 10); // Parse the incoming string value back to an integer
    },
    parseLiteral(ast) {
        if (ast.kind === graphql_1.Kind.INT || ast.kind === graphql_1.Kind.STRING) {
            return parseInt(ast.value, 10);
        }
        return null;
    },
});
const typeDefs = (0, apollo_server_1.gql) `
  scalar Long

  type Team {
    teamId: Int!
    teamName: String!
    teamSName: String!
    imageId: Int!
    matchId: Int!
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
    startDate: Long!
    endDate: Long!
    seriesStartDt: Long!
    seriesEndDt: Long!
    venueInfo: VenueInfo!
    team1ImageURL: String!
    team2ImageURL: String!
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