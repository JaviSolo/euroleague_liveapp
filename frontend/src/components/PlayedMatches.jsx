import React, { useEffect, useState } from "react";
import TeamDisplay from "./TeamDisplay";
import MatchCard from "./MatchCard";
import { getTeamFromStandings } from "../utils/getTeamFromStandings";

const PlayedMatches = () => {
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [allMatches, setAllMatches] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [selectedRound, setSelectedRound] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/current_round")
      .then((res) => res.json())
      .then((data) => {
        const current = data.round;
        setSelectedRound(current);
        fetchMatches(current);
      })
      .catch((err) => console.error("Error fetching current round:", err));

    fetch("http://localhost:5000/api/euroleague_standings")
      .then((res) => res.json())
      .then((data) => setStandings(data))
      .catch((err) => console.error("Error fetching standings:", err));

    fetch("http://localhost:5000/api/all_played_matches")
      .then((res) => res.json())
      .then((data) => {
        setAllMatches(data);
        const allRounds = Array.from(
          new Set(data.map((match) => match.round).filter(Boolean))
        ).sort((a, b) => b - a);
        setRounds(allRounds);
      })
      .catch((err) => console.error("Error fetching all played matches:", err));
  }, []);

  const fetchMatches = (round) => {
    setLoading(true);
    fetch(`http://localhost:5000/api/played_matches?round=${round}`)
      .then((res) => res.json())
      .then((data) => {
        setMatches(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching played matches:", err);
        setMatches([]);
        setLoading(false);
      });
  };

  const handleRoundChange = (e) => {
    const round = parseInt(e.target.value);
    setSelectedRound(round);
    fetchMatches(round);
  };

  const getTeamData = (teamName) => {
    const team = getTeamFromStandings(teamName, standings);
    if (!team) {
      console.warn("❌ Team not found in standings:", teamName);
    }
    return team;
  };

  const sortedMatches = [...matches].sort(
    (a, b) => new Date(a.datetime) - new Date(b.datetime)
  );

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold text-center text-blue-400 tracking-tight mb-4">
        Played Matches
      </h2>

      <div className="text-center mb-4">
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
      ) : sortedMatches.length === 0 ? (
        <p className="text-gray-500 text-center col-span-full">
          No played matches found
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedMatches.map((match, index) => {
            const homeTeam = getTeamData(match.home_team);
            const awayTeam = getTeamData(match.away_team);

            const formatted = match.datetime || "Unknown date";
            const arena = match.arena || "Unknown arena";

            return (
              <MatchCard
                key={index}
                status={`${formatted} · ${arena}`}
                score={`${match.home_score} - ${match.away_score}`}
                home={<TeamDisplay team={homeTeam} fallback={match.home_team} />}
                away={<TeamDisplay team={awayTeam} fallback={match.away_team} />}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlayedMatches;
