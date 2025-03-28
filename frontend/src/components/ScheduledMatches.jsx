import React, { useEffect, useState } from "react";
import TeamDisplay from "./TeamDisplay";
import MatchCard from "./MatchCard";

const ScheduledMatches = () => {
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [selectedRound, setSelectedRound] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch data for scheduled matches and standings
  useEffect(() => {
    // Fetch available rounds from the played matches API (they contain the rounds)
    fetch("http://localhost:5000/api/played_matches")
      .then((res) => res.json())
      .then((data) => {
        const roundsArray = Array.from(
          new Set(data.map((match) => match.round)) // Extract rounds from played matches
        );
        setRounds(roundsArray);
        const currentRound = roundsArray[roundsArray.length - 1];
        const nextRound = currentRound + 1;
        setSelectedRound(nextRound); // Default to the next round available if current has no matches
      })
      .catch((err) => console.error("Error fetching played matches:", err));

    fetch("http://localhost:5000/api/euroleague_standings")
      .then((res) => res.json())
      .then((data) => setStandings(data))
      .catch((err) => console.error("Error fetching standings:", err));

    // Fetch matches based on the selected round
    if (selectedRound !== null) {
      fetch(`http://localhost:5000/api/scheduled_matches?round=${selectedRound}`)
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
    }
  }, [selectedRound]); // Fetch matches when selectedRound changes

  const normalizeName = (name) => name.toLowerCase().split(" ")[0];

  const getTeamData = (teamName) => {
    const target = normalizeName(teamName);
    const team = standings.find(
      (team) => normalizeName(team["club.name"]) === target
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
    const round = event.target.value;
    setSelectedRound(round); // Set the selected round and trigger re-fetch
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center text-blue-400 tracking-tight mb-6">
        Upcoming Matches
      </h2>

      {/* Dropdown for selecting round */}
      <div className="text-center mb-4">
        <select
          value={selectedRound}
          onChange={handleRoundChange}
          className="p-2 bg-blue-500 text-white rounded-md"
        >
          {rounds.length > 0 &&
            rounds.map((round, index) => (
              <option key={index} value={round}>
                Round {round}
              </option>
            ))}
        </select>
      </div>

      {/* Matches */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.length === 0 ? (
            <p className="text-gray-400 text-center col-span-full">
              No upcoming matches available
            </p>
          ) : (
            matches.map((match, index) => {
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
