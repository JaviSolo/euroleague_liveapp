import React, { useState, useEffect } from "react";

const LiveMatches = () => {
  const [matches, setMatches] = useState([]);
  const [matchDetails, setMatchDetails] = useState({});
  const [detailsVisibility, setDetailsVisibility] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [standings, setStandings] = useState([]);
  const teamNameOverrides = {
    "Olimpia Milano": "EA7 Emporio Armani Milan",
  };
  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString();
  };

  const getSecondsSinceUpdate = () => {
    if (!lastUpdated) return null;
    return Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 1000);
  };

  const getTeamData = (teamName) => {
    const normalizedName = teamNameOverrides[teamName] || teamName;
  
    const team = standings.find((team) => {
      const officialName = team["club.name"].toLowerCase();
      const candidate = normalizedName.toLowerCase();
      return (
        officialName.includes(candidate) ||
        candidate.includes(officialName)
      );
    });
  
    if (!team) {
      console.warn("❌ Team not found in standings:", teamName);
    }
  
    return team;
  };
  

  useEffect(() => {
    fetch("/api/euroleague_standings")
      .then((res) => res.json())
      .then((data) => setStandings(data))
      .catch((err) => console.error("Error fetching standings:", err));
  }, []);

  useEffect(() => {
    const fetchLiveMatches = () => {
      console.time("⏱️ Tiempo /api/live_matches");
      fetch("/api/live_matches")
        .then((res) => res.json())
        .then((data) => {
          console.timeEnd("⏱️ Tiempo /api/live_matches");
          setMatches(data.matches || []);
          setLastUpdated(data.last_updated || null);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching live matches:", err);
          setLoading(false);
        });
    };

    fetchLiveMatches();
    const intervalId = setInterval(fetchLiveMatches, 10000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchDetailsForVisibleMatches = () => {
      if (matches.length === 0) return;

      Object.entries(detailsVisibility).forEach(([url, visible]) => {
        if (visible) {
          fetch(`/api/match_details?url=${encodeURIComponent(url)}`)
            .then((res) => res.json())
            .then((data) => {
              setMatchDetails((prevDetails) => ({
                ...prevDetails,
                [url]: data,
              }));
            })
            .catch((err) => console.error("Error fetching match details:", err));
        }
      });
    };

    fetchDetailsForVisibleMatches();
    const intervalId = setInterval(fetchDetailsForVisibleMatches, 10000);
    return () => clearInterval(intervalId);
  }, [detailsVisibility, matches]);

  const handleViewDetails = (url) => {
    setDetailsVisibility((prev) => ({
      ...prev,
      [url]: !prev[url],
    }));

    if (!matchDetails[url]) {
      fetch(`/api/match_details?url=${encodeURIComponent(url)}`)
        .then((res) => res.json())
        .then((data) => {
          setMatchDetails((prevDetails) => ({
            ...prevDetails,
            [url]: data,
          }));
        })
        .catch((err) => console.error("Error fetching match details:", err));
    }
  };

  const secondsAgo = getSecondsSinceUpdate();

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Live EuroLeague Matches</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="flex justify-center items-center h-40 col-span-full">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : matches.length === 0 ? (
          <p className="text-gray-500 text-center col-span-full">No live matches available</p>
        ) : (
          matches.map((match, index) => {
            const homeTeam = getTeamData(match.team1);
            const awayTeam = getTeamData(match.team2);

            return (
              <div
                key={index}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition duration-200"
              >
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-4">
                    {homeTeam ? (
                      <div className="flex items-center gap-2">
                        <img src={homeTeam["club.images.crest"]} alt={homeTeam["club.name"]} className="w-6 h-6" />
                        <span className="text-gray-800 font-medium">{homeTeam["club.name"]}</span>
                      </div>
                    ) : (
                      <span className="text-gray-800">{match.team1}</span>
                    )}

                    <span className="text-gray-500">vs</span>

                    {awayTeam ? (
                      <div className="flex items-center gap-2">
                        <img src={awayTeam["club.images.crest"]} alt={awayTeam["club.name"]} className="w-6 h-6" />
                        <span className="text-gray-800 font-medium">{awayTeam["club.name"]}</span>
                      </div>
                    ) : (
                      <span className="text-gray-800">{match.team2}</span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mt-2">{match.quarter} - {match.time}</p>
                  <p className="text-sm text-gray-600">Live</p>
                </div>
                <p className="text-lg font-bold text-center text-gray-700">{match.score}</p>
                <div className="mt-4 text-center">
                  <button
                    onClick={() => handleViewDetails(match.url)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                  >
                    {detailsVisibility[match.url] ? "Close Details" : "View Details"}
                  </button>
                </div>

                {detailsVisibility[match.url] && matchDetails[match.url] && (
                  <div className="mt-4 bg-gray-100 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800">Points by Quarter</h4>
                    <table className="w-full text-sm bg-gray-100 border-collapse">
                      <thead>
                        <tr>
                          <th className="border border-gray-300 px-2 py-1 text-gray-900">1st</th>
                          <th className="border border-gray-300 px-2 py-1 text-gray-900">2nd</th>
                          <th className="border border-gray-300 px-2 py-1 text-gray-900">3rd</th>
                          <th className="border border-gray-300 px-2 py-1 text-gray-900">4th</th>
                          <th className="border border-gray-300 px-2 py-1 text-gray-900">OT</th>
                          <th className="border border-gray-300 px-2 py-1 text-gray-900">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          {matchDetails[match.url].home_quarter_scores.map((val, i) => (
                            <td key={i} className="border border-gray-300 px-2 py-1 text-gray-900">{val}</td>
                          ))}
                          <td className="border border-gray-300 px-2 py-1 text-gray-900">{matchDetails[match.url].home_total}</td>
                        </tr>
                        <tr>
                          {matchDetails[match.url].away_quarter_scores.map((val, i) => (
                            <td key={i} className="border border-gray-300 px-2 py-1 text-gray-900">{val}</td>
                          ))}
                          <td className="border border-gray-300 px-2 py-1 text-gray-900">{matchDetails[match.url].away_total}</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-800">Top 3 Players</h4>
                      {matchDetails[match.url].top_player_stats === "Not found" ? (
                        <p className="text-gray-600">No top players available</p>
                      ) : (
                        <ul>
                          {matchDetails[match.url].top_player_stats.map((player, index) => (
                            <li key={index} className="text-gray-600">
                              {player.name} ({player.team}): {player.points} points
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-800">Team Statistics</h4>
                      {matchDetails[match.url].team_statistics === "Not found" ? (
                        <p className="text-gray-600">No team statistics available</p>
                      ) : (
                        <ul>
                          {matchDetails[match.url].team_statistics.map((stat, index) => (
                            <li key={index} className="text-gray-600">
                              {stat.label}: {stat.home} - {stat.away}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LiveMatches;
