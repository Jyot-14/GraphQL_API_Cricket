import axios from 'axios';
import pool from '../db';

async function fetchPlayersData(matchId: string, teamId: number) {
  try {
    const response = await axios.get(
      `https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/${matchId}/team/${teamId}`,
      {
        headers: {
          'X-RapidAPI-Key':
            'eda7dcfeb4mshd896c7edbdad4fdp13e213jsn1127558118a2',
          'X-RapidAPI-Host': 'cricbuzz-cricket.p.rapidapi.com',
        },
      }
    );

    const playersData = response.data?.players;

    if (!playersData) {
      console.warn('No players data found for match ID:', matchId);
      return []; // Skip processing for this match ID
    }

    if (playersData && Array.isArray(playersData.Squad)) {
      // If the response data has 'Squad' as an array, then it's the desired structure
      return playersData.Squad.map((player: any) => ({
        id: player.id,
        name: player.name,
        fullName: player.fullName,
        nickName: player.nickName,
        captain: player.captain,
        role: player.role,
        keeper: player.keeper,
        substitute: player.substitute,
        teamId: player.teamId,
        battingStyle: player.battingStyle,
        bowlingStyle: player.bowlingStyle,
        teamName: player.teamName,
        faceImageId: player.faceImageId,
      }));
    } else if (
      playersData &&
      Array.isArray(playersData['playing XI']) &&
      Array.isArray(playersData.bench)
    ) {
      // If the response data has both 'playing XI' and 'bench' as arrays, then concatenate and create 'Squad'
      const playingXI = playersData['playing XI'];
      const bench = playersData.bench;
      const squad = playingXI.concat(bench).map((player: any) => ({
        id: player.id,
        name: player.name,
        fullName: player.fullName,
        nickName: player.nickName,
        captain: player.captain,
        role: player.role,
        keeper: player.keeper,
        substitute: player.substitute,
        teamId: player.teamId,
        battingStyle: player.battingStyle,
        bowlingStyle: player.bowlingStyle,
        teamName: player.teamName,
        faceImageId: player.faceImageId,
      }));

      return squad;
    } else {
      console.error('Invalid response data for players data:', playersData);
      throw new Error('Invalid response data for players data.');
    }
  } catch (error) {
    console.error('Error fetching players data:', error);
    throw new Error('Failed to fetch players data.');
  }
}

function addImageURLToPlayers(
  players: { faceImageId: number }[],
  teamImageId: number
) {
  // Assuming 'players' is an array of player objects
  return players.map((player: { faceImageId: number }) => ({
    ...player,
    imageURL: `https://firebasestorage.googleapis.com/v0/b/my11-6b9a0.appspot.com/o/Jyot_Players_images%2FPlayers-Images%2F${player.faceImageId}.jpg?alt=media`,
  }));
}

const playersResolvers = {
  Query: {
    getPlayersDataByTeamId: async (parent: any, args: { teamId: number }) => {
      try {
        const query = `
          SELECT * FROM players
          WHERE teamId = $1;
        `;
        const { teamId } = args;
        const { rows } = await pool.query(query, [teamId]);
        return rows;
      } catch (error) {
        console.error('Error fetching players data from DB:', error);
        throw new Error('Failed to fetch players data from DB.');
      }
    },
  },

  Mutation: {
    storePlayersData: async () => {
      try {
        const successMessages = [];

        // Fetch match data from the database and get the first 10 matches sorted by startDate ASC.
        const query = `
          SELECT match_id, team1_id, team2_id FROM upcoming_matches
          ORDER BY start_date ASC
          LIMIT 10;
        `;

        const { rows } = await pool.query(query);

        // Fetch and store players' data for each match and team
        for (const row of rows) {
          const { match_id, team1_id, team2_id } = row;

          // Fetch and store players' data for team1
          const playersDataTeam1 = await fetchPlayersData(match_id, team1_id);
          const playersDataTeam1WithImageURL = addImageURLToPlayers(
            playersDataTeam1,
            team1_id
          );
          await storePlayersDataInDB(playersDataTeam1WithImageURL);

          // Fetch and store players' data for team2
          const playersDataTeam2 = await fetchPlayersData(match_id, team2_id);
          const playersDataTeam2WithImageURL = addImageURLToPlayers(
            playersDataTeam2,
            team2_id
          );
          await storePlayersDataInDB(playersDataTeam2WithImageURL);

          successMessages.push(
            `Players data stored successfully for Match ID: ${match_id}`
          );
        }

        return successMessages;
      } catch (error) {
        console.error('Error storing players data:', error);
        throw new Error('Failed to store players data.');
      }
    },
  },
};

async function storePlayersDataInDB(playersData: any[]) {
  try {
    const insertQuery = `
      INSERT INTO players (id, name, fullName, nickName, captain, role, keeper, substitute, teamId, battingStyle, bowlingStyle, teamName, faceImageId, imageURL)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT DO NOTHING;
    `;

    for (const player of playersData) {
      const {
        id,
        name,
        fullName,
        nickName,
        captain,
        role,
        keeper,
        substitute,
        teamId,
        battingStyle,
        bowlingStyle,
        teamName,
        faceImageId,
        imageURL,
      } = player;

      await pool.query(insertQuery, [
        id,
        name,
        fullName,
        nickName,
        captain,
        role,
        keeper,
        substitute,
        teamId,
        battingStyle,
        bowlingStyle,
        teamName,
        faceImageId,
        imageURL,
      ]);
    }
  } catch (error) {
    console.error('Error storing players data in DB:', error);
    throw new Error('Failed to store players data in DB.');
  }
}

export default playersResolvers;
