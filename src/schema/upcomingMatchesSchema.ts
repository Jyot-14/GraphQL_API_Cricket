import { gql } from 'apollo-server';
import { GraphQLScalarType, Kind } from 'graphql';

// Custom scalar type for representing large integers
const GraphQLLong = new GraphQLScalarType({
  name: 'Long',
  description: 'Custom scalar type for representing large integers',
  serialize(value: any) {
    return String(value); // Convert the value to a string to preserve precision
  },
  parseValue(value: any) {
    return parseInt(value, 10); // Parse the incoming string value back to an integer
  },
  parseLiteral(ast: any) {
    if (ast.kind === Kind.INT || ast.kind === Kind.STRING) {
      return parseInt(ast.value, 10);
    }
    return null;
  },
});

const typeDefs = gql`
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

export default typeDefs;
