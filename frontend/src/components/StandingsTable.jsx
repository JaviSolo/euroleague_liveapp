import React, { useEffect, useState } from "react";

const StandingsTable = () => {
  const [standings, setStandings] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/euroleague_standings")
      .then((res) => res.json())
      .then((data) => setStandings(data))
      .catch((err) => console.error("Error fetching standings:", err));
  }, []);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg overflow-x-auto">
      <h2 className="text-3xl font-bold text-center text-blue-400 tracking-tight mb-6">
        Standings
      </h2>
      <table className="w-full table-auto text-sm text-white">
        <thead>
          <tr className="bg-gray-700 text-gray-300">
            <th className="p-3 text-left">#</th>
            <th className="p-3 text-left">Team</th>
            <th className="p-3 text-center">W-L</th>
            <th className="p-3 text-center">Win %</th>
            <th className="p-3 text-center">+/-</th>
            <th className="p-3 text-center">Last 5</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team) => (
            <tr key={team["club.code"]} className="border-t border-gray-600 hover:bg-gray-700">
              <td className="p-3">{team.position}</td>
              <td className="p-3 flex items-center gap-2">
                <img
                  src={team["club.images.crest"]}
                  alt={team["club.name"]}
                  className="w-6 h-6"
                />
                <span className="font-medium">{team["club.name"]}</span>
              </td>
              <td className="p-3 text-center">
                {team.gamesWon}-{team.gamesLost}
              </td>
              <td className="p-3 text-center">{team.winPercentage}</td>
              <td className="p-3 text-center">{team.pointsDifference}</td>
              <td className="p-3 text-center flex justify-center gap-1">
                {team.last5Form.map((result, index) => (
                  <span
                    key={index}
                    className={`w-4 h-4 rounded-full ${
                      result === "W" ? "bg-green-400" : "bg-red-400"
                    }`}
                    title={result}
                  ></span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StandingsTable;
