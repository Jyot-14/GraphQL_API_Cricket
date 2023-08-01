import express from 'express';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServer } from '@apollo/server';
import cors from 'cors';
import typeDefs from './schema/upcomingMatchesSchema';
import resolvers from './resolver/upcomingMatchesResolver';
import dotenv from 'dotenv';
import playersTypeDefs from './schema/playersDataSchema';
import playersResolvers from './resolver/playersDataResolver';
dotenv.config();

async function init() {
  const app = express();
  const PORT = Number(process.env.PORT);
  app.use(express.json());

  // Enable CORS middleware
  app.use(cors());

  // Create GraphQL Server
  const server = new ApolloServer({
    typeDefs: [typeDefs, playersTypeDefs],
    resolvers: [resolvers, playersResolvers],
  });

  // Start the server
  await server.start();

  app.get('/', (req, res) => {
    res.json({ message: 'Server is up and running' });
  });

  app.use('/graphql', expressMiddleware(server));

  app.listen(PORT, () => console.log(`Server started at PORT:${PORT}`));
}

init();
