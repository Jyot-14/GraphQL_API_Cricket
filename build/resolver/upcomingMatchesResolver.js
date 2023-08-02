"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const db_1 = __importDefault(require("../db"));
async function fetchUpcomingMatchesData() {
    try {
        const response = await axios_1.default.get('https://cricbuzz-cricket.p.rapidapi.com/matches/v1/upcoming', {
            headers: {
                'X-RapidAPI-Key': '569fb7e383msh80c3b0da2d31424p154ea2jsn8e82cd449388',
                'X-RapidAPI-Host': 'cricbuzz-cricket.p.rapidapi.com',
            },
        });
        const rawData = response.data;
        // Filter and update the data
        const updatedData = rawData.typeMatches.flatMap((typeMatch) => typeMatch.seriesMatches
            .flatMap((seriesMatch) => seriesMatch.seriesAdWrapper ? seriesMatch.seriesAdWrapper.matches : [])
            .filter((match) => match.matchInfo.matchFormat.toLowerCase() === 'odi' ||
            match.matchInfo.matchFormat.toLowerCase() === 't20' // Include T20 matches
        )
            .map((match) => {
            const { matchInfo } = match;
            const { team1, team2 } = matchInfo; // Extract team1 and team2 from matchInfo
            // Fetch the team1_image_id and team2_image_id from the teams object
            const team1_image_id = team1 && team1.imageId;
            const team2_image_id = team2 && team2.imageId;
            const team1ImageURL = `https://firebasestorage.googleapis.com/v0/b/my11-6b9a0.appspot.com/o/Jyot_Players_images%2FTeams-Images%2F${team1_image_id}.jpg?alt=media`;
            const team2ImageURL = `https://firebasestorage.googleapis.com/v0/b/my11-6b9a0.appspot.com/o/Jyot_Players_images%2FTeams-Images%2F${team2_image_id}.jpg?alt=media`;
            // Convert date strings to numbers (timestamps are in milliseconds)
            const convertToDateNumber = (dateStr) => dateStr ? parseInt(dateStr, 10) : null;
            const startDate = convertToDateNumber(matchInfo.startDate);
            const endDate = convertToDateNumber(matchInfo.endDate);
            const seriesStartDt = convertToDateNumber(matchInfo.seriesStartDt);
            const seriesEndDt = convertToDateNumber(matchInfo.seriesEndDt);
            return {
                ...matchInfo,
                startDate,
                endDate,
                seriesStartDt,
                seriesEndDt,
                team1ImageURL,
                team2ImageURL,
            };
        }));
        return updatedData;
    }
    catch (error) {
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
            }
            catch (error) {
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
                    const { matchId, seriesId, matchDesc, matchFormat, team1, team2, startDate, endDate, seriesStartDt, seriesEndDt, venueInfo, team1_image_id, team2_image_id, } = match;
                    // Generate the image URLs
                    const team1ImageURL = `https://firebasestorage.googleapis.com/v0/b/my11-6b9a0.appspot.com/o/Jyot_Players_images%2FTeams-Images%2F${team1_image_id}.jpg?alt=media`;
                    const team2ImageURL = `https://firebasestorage.googleapis.com/v0/b/my11-6b9a0.appspot.com/o/Jyot_Players_images%2FTeams-Images%2F${team2_image_id}.jpg?alt=media`;
                    const query = `
  INSERT INTO upcoming_matches
  (match_id, series_id, match_desc, match_format, team1_id, team1_name, team1_sname, team1_image_id,
    team2_id, team2_name, team2_sname, team2_image_id, start_date, end_date, series_start_dt, series_end_dt,
    ground, city, country, timezone, team1_imageurl, team2_imageurl) 
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
  ON CONFLICT (match_id) DO UPDATE
  SET
    series_id = EXCLUDED.series_id,
    match_desc = EXCLUDED.match_desc,
    match_format = EXCLUDED.match_format,
    team1_id = EXCLUDED.team1_id,
    team1_name = EXCLUDED.team1_name,
    team1_sname = EXCLUDED.team1_sname,
    team1_image_id = EXCLUDED.team1_image_id,
    team2_id = EXCLUDED.team2_id,
    team2_name = EXCLUDED.team2_name,
    team2_sname = EXCLUDED.team2_sname,
    team2_image_id = EXCLUDED.team2_image_id,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    series_start_dt = EXCLUDED.series_start_dt,
    series_end_dt = EXCLUDED.series_end_dt,
    ground = EXCLUDED.ground,
    city = EXCLUDED.city,
    country = EXCLUDED.country,
    timezone = EXCLUDED.timezone,
    team1_imageurl = EXCLUDED.team1_imageurl,
    team2_imageurl = EXCLUDED.team2_imageurl;
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
                        team1ImageURL,
                        team2ImageURL,
                    ];
                    // Execute the query using the pool
                    await db_1.default.query(query, values);
                }
                return updatedData;
            }
            catch (error) {
                console.error('Error updating upcoming matches:', error.message);
                throw new Error('Error updating upcoming matches');
            }
        },
        updateTeams: async () => {
            try {
                // Fetch the updated data from the external API
                const updatedData = await fetchUpcomingMatchesData();
                // Extract unique teams from the fetched data
                const uniqueTeams = Array.from(new Set(updatedData.flatMap((match) => [
                    { teamId: match.team1.teamId, matchId: match.matchId },
                    { teamId: match.team2.teamId, matchId: match.matchId },
                ])));
                // Store the unique teams in the "teams" table
                for (const team of uniqueTeams) {
                    const query = `
        INSERT INTO teams (team_id, match_id)
        VALUES ($1, $2)
        ON CONFLICT (team_id) DO NOTHING;
      `;
                    const values = [
                        team.teamId,
                        team.matchId,
                    ];
                    // Execute the query using the pool
                    await db_1.default.query(query, values);
                }
                return uniqueTeams;
            }
            catch (error) {
                console.error('Error updating teams:', error.message);
                throw new Error('Error updating teams');
            }
        },
    },
};
exports.default = resolvers;
//# sourceMappingURL=upcomingMatchesResolver.js.map