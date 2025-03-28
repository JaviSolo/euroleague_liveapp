import React, { useState, useEffect } from "react";
import TeamDisplay from "./TeamDisplay";
import MatchCard from "./MatchCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
} from "recharts";

const LiveMatches = () => {
  const [matches, setMatches] = useState([]);
  const [matchDetails, setMatchDetails] = useState({});
  const [detailsVisibility, setDetailsVisibility] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [standings, setStandings] = useState([]);
  const [currentRound, setCurrentRound] = useState(null);


  const teamNameOverrides = {
    "Olimpia Milano": "EA7 Emporio Armani Milan",
  };

  const getTeamData = (teamName) => {
    const normalizedName = teamNameOverrides[teamName] || teamName;
    return standings.find((team) =>
      team["club.name"].toLowerCase().includes(normalizedName.toLowerCase()) ||
      normalizedName.toLowerCase().includes(team["club.name"].toLowerCase())
    );
  };

  useEffect(() => {
    fetch("/api/euroleague_standings")
      .then((res) => res.json())
      .then((data) => setStandings(data))
      .catch((err) => console.error("Error fetching standings:", err));
  }, []);

  useEffect(() => {
    fetch("/api/current_round")
      .then((res) => res.json())
      .then((data) => {
        if (data.round) setCurrentRound(data.round);
      })
      .catch((err) => console.error("Error fetching round:", err));
  }, []);
  

  useEffect(() => {
    const fetchLiveMatches = () => {
      fetch("/api/live_matches")
        .then((res) => res.json())
        .then((data) => {
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
      matches.forEach((match) => {
        const url = match.url;
        if (detailsVisibility[url]) {
          fetch(`/api/match_details?url=${encodeURIComponent(url)}`)
            .then((res) => res.json())
            .then((data) => {
              setMatchDetails((prev) => ({ ...prev, [url]: data }));
            })
            .catch((err) => console.error("Error fetching match details:", err));
        }
      });
    };

    fetchDetailsForVisibleMatches();
    const interval = setInterval(fetchDetailsForVisibleMatches, 10000);
    return () => clearInterval(interval);
  }, [detailsVisibility, matches]);

  const handleViewDetails = (url) => {
    setDetailsVisibility((prev) => ({ ...prev, [url]: !prev[url] }));
  };

  const renderStatisticsChart = (stats) => {
    const data = stats.map((stat) => ({
      name: stat.label,
      Home: parseInt(stat.home),
      Away: parseInt(stat.away),
    }));

    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart layout="vertical" data={data} margin={{ left: 40 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" tick={{ fill: '#4B5563' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="Home" fill="#3B82F6">
            <LabelList dataKey="Home" position="right" />
          </Bar>
          <Bar dataKey="Away" fill="#EF4444">
            <LabelList dataKey="Away" position="right" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center text-blue-400 tracking-tight mb-6">
        Live Matches
      </h2>
      {currentRound && (
        <p className="text-center text-sm text-gray-400 mb-4">Round {currentRound}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-10">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : matches.length === 0 ? (
          <p className="text-gray-400 text-center col-span-full">No live matches found</p>
        ) : (
          matches.map((match, index) => {
            const homeTeam = getTeamData(match.team1);
            const awayTeam = getTeamData(match.team2);
            const details = matchDetails[match.url];

            return (
              <div
                key={index}
                className="bg-gray-900 p-4 rounded-lg shadow-md hover:shadow-xl transition duration-200"
              >
                <MatchCard
                  home={<TeamDisplay team={homeTeam} fallback={match.team1} />}
                  away={<TeamDisplay team={awayTeam} fallback={match.team2} />}
                  score={match.score}
                  status={`${match.quarter} - ${match.time}`}
                />
                <div className="mt-4 text-center">
                  <button
                    onClick={() => handleViewDetails(match.url)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    {detailsVisibility[match.url] ? "Close Details" : "View Details"}
                  </button>
                </div>

                {detailsVisibility[match.url] && details && (
                  <div className="mt-4 bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-white font-semibold mb-2">Points by Quarter</h4>
                    <table className="w-full text-sm text-gray-300">
                      <thead>
                        <tr>
                          <th className="text-left w-8"></th>
                          {"1st 2nd 3rd 4th OT Total".split(" ").map((label, i) => (
                            <th key={i} className="px-2 py-1 text-center">{label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="text-center">
                            {homeTeam?.["club.images.crest"] && (
                              <img
                                src={homeTeam["club.images.crest"]}
                                alt="Home Team Crest"
                                className="w-5 h-5 mx-auto"
                              />
                            )}
                          </td>
                          {details.home_quarter_scores.map((score, i) => (
                            <td key={i} className="text-center">{score}</td>
                          ))}
                          <td className="text-center font-bold">{details.home_total}</td>
                        </tr>
                        <tr>
                          <td className="text-center">
                            {awayTeam?.["club.images.crest"] && (
                              <img
                                src={awayTeam["club.images.crest"]}
                                alt="Away Team Crest"
                                className="w-5 h-5 mx-auto"
                              />
                            )}
                          </td>
                          {details.away_quarter_scores.map((score, i) => (
                            <td key={i} className="text-center">{score}</td>
                          ))}
                          <td className="text-center font-bold">{details.away_total}</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="mt-4">
                      <h4 className="text-white font-semibold mb-2">Top 3 Players</h4>
                      {details.top_player_stats === "Not found" ? (
                        <p className="text-gray-400">No top players available</p>
                      ) : (
                        <ul className="text-gray-300 space-y-1">
                          {details.top_player_stats.map((player, i) => (
                            <li key={i}>
                              {player.name} ({player.team}): {player.points} pts
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="mt-4">
                      <h4 className="text-white font-semibold mb-2">Team Statistics</h4>
                      {details.team_statistics === "Not found" ? (
                        <p className="text-gray-400">No team statistics available</p>
                      ) : (
                        renderStatisticsChart(details.team_statistics)
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
