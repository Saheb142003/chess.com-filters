import axios from "axios";

// This is a Vercel Serverless Function
export default async function handler(req, res) {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    // 1. Get user archives
    const archivesRes = await axios.get(`https://api.chess.com/pub/player/${username}/games/archives`);
    const archives = archivesRes.data.archives;

    if (!archives || archives.length === 0) {
      return res.status(200).json({});
    }

    // 2. Fetch last 3 months in parallel (Vercel has high concurrency)
    const recentArchives = archives.slice(-3);
    const archivePromises = recentArchives.map(url => axios.get(url));
    const archiveResults = await Promise.all(archivePromises);

    const countryStats = {};

    archiveResults.forEach(archive => {
      const games = archive.data.games;
      games.forEach(game => {
        const isWhite = game.white.username.toLowerCase() === username.toLowerCase();
        const opponent = isWhite ? game.black : game.white;
        const playerResult = isWhite ? game.white.result : game.black.result;
        
        // Extract country from opponent's profile URL
        // Note: Real country names would require another API call per user.
        // For performance, we use the country code from the URL or a placeholder.
        const countryCode = opponent.country ? opponent.country.split("/").pop() : "unknown";
        
        if (!countryStats[countryCode]) {
          countryStats[countryCode] = [];
        }

        countryStats[countryCode].push({
          opponent: opponent.username,
          result: playerResult,
          url: game.url,
          timestamp: game.end_time,
          timeClass: game.time_class
        });
      });
    });

    res.status(200).json(countryStats);
  } catch (error) {
    console.error("Chess.com API Error:", error.message);
    res.status(error.response?.status || 500).json({ 
      error: "User not found or Chess.com API error",
      details: error.message 
    });
  }
}
