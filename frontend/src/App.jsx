import { useState, useMemo } from "react";
import axios from "axios";
import CountryFilter from "./components/CountryFilter";
import GameList from "./components/GameList";

// Clean relative path works everywhere thanks to Vite Proxy (dev) and Vercel Rewrites (prod)
const API_BASE_URL = '/api/chess';

// King Logo SVG component
const KingLogo = () => (
  <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '18px' }}>
    <path d="M50 10V22M44 16H56" stroke="var(--accent-green)" strokeWidth="6" strokeLinecap="round"/>
    <path d="M50 25C42 25 35 30 35 40C35 45 40 48 50 48C60 48 65 45 65 40C65 30 58 25 50 25Z" fill="var(--accent-green)"/>
    <path d="M25 50L35 75H65L75 50L60 60L50 50L40 60L25 50Z" fill="var(--accent-green)"/>
    <path d="M30 80H70V90H30V80Z" fill="var(--accent-green)"/>
  </svg>
);

function App() {
  const [username, setUsername] = useState("");
  const [data, setData] = useState({});
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedResult, setSelectedResult] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [opponentQuery, setOpponentQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchGames = async () => {
    if (!username) return;
    setLoading(true);
    setError("");
    setSelectedCountry("");
    setSelectedResult("");
    setSelectedType("");
    setOpponentQuery("");
    try {
      const res = await axios.get(`${API_BASE_URL}/${username}`);
      setData(res.data);
      if (Object.keys(res.data).length === 0) {
        setError("No games found for this user in recent archives.");
      }
    } catch (err) {
      console.error(err);
      setError("User not found or Chess.com API error.");
    } finally {
      setLoading(false);
    }
  };

  const filteredGames = useMemo(() => {
    let games = [];
    if (selectedCountry) {
      games = data[selectedCountry] || [];
    } else {
      games = Object.values(data).flat();
    }

    if (selectedResult) {
      games = games.filter(g => {
        const res = g.result;
        let category = "loss";
        if (res === "win") category = "win";
        else if (["draw", "stalemate", "repetition", "insufficient", "50move", "agreed", "timevsinsufficient"].includes(res)) category = "draw";
        
        return category === selectedResult;
      });
    }

    if (selectedType) {
      games = games.filter(g => g.timeClass === selectedType);
    }

    if (opponentQuery) {
      games = games.filter(g => g.opponent.toLowerCase().includes(opponentQuery.toLowerCase()));
    }

    return games.sort((a, b) => b.timestamp - a.timestamp);
  }, [data, selectedCountry, selectedResult, selectedType, opponentQuery]);

  return (
    <div className="container">
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem' }}>
        <KingLogo />
        <h1 className="title" style={{ margin: 0 }}>Chess.com <span>Analysis</span></h1>
      </header>

      <div className="search-box">
        <input
          type="text"
          placeholder="Chess.com Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchGames()}
        />
        <button onClick={fetchGames} disabled={loading}>
          {loading ? "..." : "Analyze"}
        </button>
      </div>

      {loading && (
        <div className="loader-box">
          <div className="chess-loader"></div>
          <p style={{ fontWeight: '600' }}>Fetching game archives...</p>
        </div>
      )}

      {error && (
        <div style={{ textAlign: 'center', color: 'var(--danger)', marginBottom: '2rem', padding: '1rem', background: 'rgba(250, 49, 45, 0.1)', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {!loading && Object.keys(data).length > 0 && (
        <div className="main-layout">
          <CountryFilter
            countries={Object.keys(data)}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
            selectedResult={selectedResult}
            setSelectedResult={setSelectedResult}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            gameData={data}
          />

          <div className="content-area">
            <div className="local-search-bar" style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Search Opponent Username..."
                value={opponentQuery}
                onChange={(e) => setOpponentQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.8rem 1.2rem',
                  background: 'var(--bg-sidebar)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
            <GameList
              games={filteredGames}
              selectedCountry={selectedCountry}
              selectedResult={selectedResult}
              selectedType={selectedType}
            />
          </div>
        </div>
      )}

      {!loading && !error && Object.keys(data).length === 0 && !username && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '4rem' }}>
          <p>Enter a username to analyze their global performance.</p>
        </div>
      )}
    </div>
  );
}

export default App;
