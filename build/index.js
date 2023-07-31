"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express4_1 = require("@apollo/server/express4");
const server_1 = require("@apollo/server");
const upcomingMatchesSchema_1 = __importDefault(require("./schema/upcomingMatchesSchema"));
const upcomingMatchesResolver_1 = __importDefault(require("./resolver/upcomingMatchesResolver"));
const dotenv_1 = __importDefault(require("dotenv"));
const playersDataSchema_1 = __importDefault(require("./schema/playersDataSchema"));
const playersDataResolver_1 = __importDefault(require("./resolver/playersDataResolver"));
dotenv_1.default.config();
async function init() {
    const app = (0, express_1.default)();
    const PORT = Number(process.env.PORT);
    app.use(express_1.default.json());
    // Create GraphQL Server
    const server = new server_1.ApolloServer({
        typeDefs: [upcomingMatchesSchema_1.default, playersDataSchema_1.default],
        resolvers: [upcomingMatchesResolver_1.default, playersDataResolver_1.default],
    });
    // Start the server
    await server.start();
    app.get('/', (req, res) => {
        res.json({ message: 'Server is up and running' });
    });
    app.use('/graphql', (0, express4_1.expressMiddleware)(server));
    app.listen(PORT, () => console.log(`Server started at PORT:${PORT}`));
}
init();
//# sourceMappingURL=index.js.map