declare const playersResolvers: {
    Query: {
        getPlayersDataByTeamId: (parent: any, args: {
            teamId: number;
        }) => Promise<any[]>;
    };
    Mutation: {
        storePlayersData: () => Promise<string[]>;
    };
};
export default playersResolvers;
