import axios from 'axios';
import pool from '../db';

async function fetchUpcomingMatchesData() {
  try {
    const response = await axios.get(
      'https://cricbuzz-cricket.p.rapidapi.com/matches/v1/upcoming',
      {
        headers: {
          'X-RapidAPI-Key':
            '569fb7e383msh80c3b0da2d31424p154ea2jsn8e82cd449388',
          'X-RapidAPI-Host': 'cricbuzz-cricket.p.rapidapi.com',
        },
      }
    );

    const rawData = response.data;

    // Filter and update the data
    const updatedData = rawData.typeMatches.flatMap((typeMatch: any) =>
      typeMatch.seriesMatches
        .flatMap((seriesMatch: any) =>
          seriesMatch.seriesAdWrapper ? seriesMatch.seriesAdWrapper.matches : []
        )
        .filter(
          (match: any) =>
            match.matchInfo.matchFormat.toLowerCase() === 'odi' ||
            match.matchInfo.matchFormat.toLowerCase() === 't20' // Include T20 matches
        )
        .map((match: any) => {
          const { matchInfo } = match;
          return {
            ...matchInfo,
            startDate: parseInt(matchInfo.startDate),
            endDate: parseInt(matchInfo.endDate),
            seriesStartDt: parseInt(matchInfo.seriesStartDt),
            seriesEndDt: parseInt(matchInfo.seriesEndDt),
          };
        })
    );

    return updatedData;
  } catch (error) {
    console.error('Error fetching upcoming matches:', error);
    throw new Error('Error fetching upcoming matches');
  }
}

const resolvers = {
  Query: {
    upcomingMatches: async () => {
      try {
        // Fetch the upcoming matches data from the external API
        const updatedData = await fetchUpcomingMatchesData();

        // Here, we are returning the fetched data directly to the GraphQL query.

        return updatedData;
      } catch (error: any) {
        console.error('Error fetching upcoming matches:', error.message);
        throw new Error('Error fetching upcoming matches');
      }
    },
  },
  Mutation: {
    updateUpcomingMatches: async () => {
      try {
        // Fetch the updated data from the external API
        const updatedData = await fetchUpcomingMatchesData();

        // Store the updated data to the PostgreSQL database
        for (const match of updatedData) {
          const {
            matchId,
            seriesId,
            matchDesc,
            matchFormat,
            team1,
            team2,
            startDate,
            endDate,
            seriesStartDt,
            seriesEndDt,
            venueInfo,
          } = match;

          const query = `
              INSERT INTO upcoming_matches
              (match_id, series_id, match_desc, match_format, team1_id, team1_name, team1_sname, team1_image_id,
                team2_id, team2_name, team2_sname, team2_image_id, start_date, end_date, series_start_dt, series_end_dt,
                ground, city, country, timezone)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
              ON CONFLICT (match_id) DO NOTHING;
            `;

          const values = [
            matchId,
            seriesId,
            matchDesc,
            matchFormat,
            team1.teamId,
            team1.teamName,
            team1.teamSName,
            team1.imageId,
            team2.teamId,
            team2.teamName,
            team2.teamSName,
            team2.imageId,
            startDate,
            endDate,
            seriesStartDt,
            seriesEndDt,
            venueInfo.ground,
            venueInfo.city,
            venueInfo.country,
            venueInfo.timezone,
          ];

          // Execute the query using the pool
          await pool.query(query, values);
        }
        return updatedData;
      } catch (error: any) {
        console.error('Error updating upcoming matches:', error.message);
        throw new Error('Error updating upcoming matches');
      }
    },

    updateTeams: async () => {
      try {
        // Fetch the updated data from the external API
        const updatedData = await fetchUpcomingMatchesData();

        // Extract unique teams from the fetched data
        const uniqueTeams = Array.from(
          new Set(
            updatedData.flatMap(
              (match: {
                team1: { teamId: number };
                team2: { teamId: number };
                matchId: number; // Assuming there is a matchId property in the match object
              }) => [
                { teamId: match.team1.teamId, matchId: match.matchId },
                { teamId: match.team2.teamId, matchId: match.matchId },
              ]
            )
          )
        );

        // Store the unique teams in the "teams" table
        for (const team of uniqueTeams) {
          const query = `
        INSERT INTO teams (team_id, match_id)
        VALUES ($1, $2)
        ON CONFLICT (team_id) DO NOTHING;
      `;

          const values = [
            (team as { teamId: number }).teamId,
            (team as { matchId: number }).matchId,
          ];
          // Execute the query using the pool
          await pool.query(query, values);
        }

        return uniqueTeams;
      } catch (error: any) {
        console.error('Error updating teams:', error.message);
        throw new Error('Error updating teams');
      }
    },
  },
};

export default resolvers;
