import React, { useState, useEffect } from "react";

const LiveMatches = () => {
  const [matches, setMatches] = useState([]);
  const [matchDetails, setMatchDetails] = useState({}); // Estado para detalles de cada partido por url
  const [detailsVisibility, setDetailsVisibility] = useState({}); // Visibilidad independiente por partido

  // Fetch live matches and update match details every 10 seconds
  useEffect(() => {
    const fetchLiveMatches = () => {
      fetch("http://localhost:5000/api/live_matches")
        .then((res) => res.json())
        .then((data) => setMatches(data))
        .catch((err) => console.error("Error fetching live matches:", err));
    };
  
    const fetchDetailsForVisibleMatches = () => {
      Object.entries(detailsVisibility).forEach(([url, visible]) => {
        if (visible) {
          fetch(`http://localhost:5000/api/match_details?url=${encodeURIComponent(url)}`)
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
  
    // Primera carga
    fetchLiveMatches();
    fetchDetailsForVisibleMatches();
  
    // Intervalo cada 10 segundos
    const intervalId = setInterval(() => {
      fetchLiveMatches();
      fetchDetailsForVisibleMatches();
    }, 10000);
  
    return () => clearInterval(intervalId);
  }, [detailsVisibility]);
  

  // Fetch match details for a specific match
  const fetchMatchDetails = (url) => {
    if (!matchDetails[url]) { // Only fetch if the details are not already in the state
      fetch(`http://localhost:5000/api/match_details?url=${encodeURIComponent(url)}`)
        .then((res) => res.json())
        .then((data) => {
          setMatchDetails((prevDetails) => ({
            ...prevDetails,
            [url]: data, // Add/update details for the specific match
          }));
        })
        .catch((err) => console.error("Error fetching match details:", err));
    }
  };

  // Handle view details for each match
  const handleViewDetails = (url) => {
    // Toggle the visibility of details for the selected match
    setDetailsVisibility((prevState) => ({
      ...prevState,
      [url]: !prevState[url], // Toggle visibility for the clicked match
    }));

    // Fetch match details for the selected match (if not already fetched)
    fetchMatchDetails(url);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Live EuroLeague Matches</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.length === 0 ? (
          <p className="text-gray-500 text-center">No live matches available</p>
        ) : (
          matches.map((match, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition duration-200"
            >
              <div className="text-center mb-4">
                <h3 className="font-semibold text-xl text-gray-800">{match.team1} vs {match.team2}</h3>
                <p className="text-sm text-gray-600">{match.quarter} - {match.time}</p>
                <p className="text-sm text-gray-600">{match.arena}</p>
              </div>
              <p className="text-lg font-bold text-center text-gray-700">
                {match.score}
              </p>
              <div className="mt-4 text-center">
                <button
                  onClick={() => handleViewDetails(match.url)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  {detailsVisibility[match.url] ? "Close Details" : "View Details"}
                </button>
              </div>

              {/* Match Details Section */}
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
                        <td className="border border-gray-300 px-2 py-1 text-gray-900">{matchDetails[match.url].home_quarter_scores[0]}</td>
                        <td className="border border-gray-300 px-2 py-1 text-gray-900">{matchDetails[match.url].home_quarter_scores[1]}</td>
                        <td className="border border-gray-300 px-2 py-1 text-gray-900">{matchDetails[match.url].home_quarter_scores[2]}</td>
                        <td className="border border-gray-300 px-2 py-1 text-gray-900">{matchDetails[match.url].home_quarter_scores[3]}</td>
                        <td className="border border-gray-300 px-2 py-1 text-gray-900">{matchDetails[match.url].home_quarter_scores[4]}</td>
                        <td className="border border-gray-300 px-2 py-1 text-gray-900">{matchDetails[match.url].home_total}</td>
                        </tr>
                        <tr>
                        <td className="border border-gray-300 px-2 py-1 text-gray-900">{matchDetails[match.url].away_quarter_scores[0]}</td>
                        <td className="border border-gray-300 px-2 py-1 text-gray-900">{matchDetails[match.url].away_quarter_scores[1]}</td>
                        <td className="border border-gray-300 px-2 py-1 text-gray-900">{matchDetails[match.url].away_quarter_scores[2]}</td>
                        <td className="border border-gray-300 px-2 py-1 text-gray-900">{matchDetails[match.url].away_quarter_scores[3]}</td>
                        <td className="border border-gray-300 px-2 py-1 text-gray-900">{matchDetails[match.url].away_quarter_scores[4]}</td>
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
          ))
        )}
      </div>
    </div>
  );
};

export default LiveMatches;
