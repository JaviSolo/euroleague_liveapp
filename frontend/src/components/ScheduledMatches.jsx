import React, { useEffect, useState } from "react";
import TeamDisplay from "./TeamDisplay";
import MatchCard from "./MatchCard";

const ScheduledMatches = () => {
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/scheduled_matches")
      .then((res) => res.json())
      .then((data) => setMatches(data))
      .catch((err) => {
        console.error("Error fetching scheduled matches:", err);
        setMatches([]);
      });

    fetch("http://localhost:5000/api/euroleague_standings")
      .then((res) => res.json())
      .then((data) => setStandings(data))
      .catch((err) => console.error("Error fetching standings:", err));
  }, []);

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

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center text-blue-400 tracking-tight mb-6">
        Upcoming Matches
      </h2>
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
    </div>
  );
};

export default ScheduledMatches;
