"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const playersTypeDefs = `
  type Player {
    id: Int
    name: String
    fullName: String
    nickName: String
    captain: Boolean
    role: String
    keeper: Boolean
    substitute: Boolean
    teamId: Int
    battingStyle: String
    bowlingStyle: String
    teamName: String
    faceImageId: Int
  }

  type Mutation {
    storePlayersData: [Player!]!
  }
`;
exports.default = playersTypeDefs;
//# sourceMappingURL=playersDataSchema.js.map