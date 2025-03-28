import React, { useEffect, useState } from "react";
import TeamDisplay from "./TeamDisplay";
import MatchCard from "./MatchCard";

const ScheduledMatches = () => {
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [selectedRound, setSelectedRound] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/current_round")
      .then((res) => res.json())
      .then((data) => {
        const nextRound = data.round + 1;
        setSelectedRound(nextRound);
        fetchMatches(nextRound);
      })
      .catch((err) => console.error("Error fetching current round:", err));

    fetch("http://localhost:5000/api/euroleague_standings")
      .then((res) => res.json())
      .then((data) => setStandings(data))
      .catch((err) => console.error("Error fetching standings:", err));
  }, []);

  const fetchMatches = (round) => {
    setLoading(true);
    fetch(`http://localhost:5000/api/scheduled_matches?round=${round}`)
      .then((res) => res.json())
      .then((data) => {
        setMatches(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching scheduled matches:", err);
        setMatches([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetch("http://localhost:5000/api/scheduled_matches")
      .then((res) => res.json())
      .then((data) => {
        const gamedays = data.map((match) => match.round).filter(Boolean);
        const uniqueRounds = Array.from(new Set(gamedays)).sort((a, b) => a - b);
        setRounds(uniqueRounds);
      })
      .catch((err) => console.error("Error fetching all scheduled matches:", err));
  }, []);

  const normalizeName = (name) => name.toLowerCase().split(" ")[0];

  const getTeamData = (teamName) => {
    const normalize = (str) =>
      str.toLowerCase().replace(/[^a-z]/g, "").slice(0, 6);

    const target = normalize(teamName);

    const team = standings.find(
      (team) => normalize(team["club.name"]) === target
    );

    if (!team) {
      console.warn("❌ Team not found in standings:", teamName);
    }

    return team;
  };

  const formatDateTime = (datetimeStr) => {
    const date = new Date(datetimeStr);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRoundChange = (event) => {
    const round = parseInt(event.target.value);
    setSelectedRound(round);
    fetchMatches(round);
  };

  const sortedMatches = [...matches].sort(
    (a, b) => new Date(a.datetime) - new Date(b.datetime)
  );

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center text-blue-400 tracking-tight mb-2">
        Upcoming Matches
      </h2>
      {selectedRound && (
        <p className="text-center text-sm text-gray-400 mb-4">Round {selectedRound}</p>
      )}

      <div className="text-center mb-6">
        <select
          value={selectedRound || ""}
          onChange={handleRoundChange}
          className="p-2 bg-blue-500 text-white rounded-md"
        >
          <option disabled value="">
            Select Round
          </option>
          {rounds.map((round, index) => (
            <option key={index} value={round}>
              Round {round}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedMatches.length === 0 ? (
            <p className="text-gray-400 text-center col-span-full">
              No upcoming matches available
            </p>
          ) : (
            sortedMatches.map((match, index) => {
              const homeTeam = getTeamData(match.home_team);
              const awayTeam = getTeamData(match.away_team);

              return (
                <MatchCard
                  key={index}
                  status={`${formatDateTime(match.datetime)} · ${match.arena}`}
                  score="Scheduled"
                  home={<TeamDisplay team={homeTeam} fallback={match.home_team} />}
                  away={<TeamDisplay team={awayTeam} fallback={match.away_team} />}
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default ScheduledMatches;
