declare const resolvers: {
    Query: {
        upcomingMatches: () => Promise<any>;
    };
    Mutation: {
        updateUpcomingMatches: () => Promise<any>;
        updateTeams: () => Promise<unknown[]>;
    };
};
export default resolvers;
