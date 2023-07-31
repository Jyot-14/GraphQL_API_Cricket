declare const playersResolvers: {
    Mutation: {
        storePlayersData: () => Promise<string[]>;
    };
};
export default playersResolvers;
