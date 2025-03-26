import React, { useEffect, useState } from 'react';

const StandingsTable = () => {
  const [standings, setStandings] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/euroleague_standings')
      .then((res) => res.json())
      .then((data) => setStandings(data))
      .catch((err) => console.error('Error fetching standings:', err));
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md max-w-full overflow-x-auto">
      <h2 className="text-xl font-bold mb-4 text-center">Standings</h2>
      <table className="w-full table-auto text-sm">
        <thead>
          <tr className="bg-gray-200 text-gray-700">
            <th className="p-2 text-left">#</th>
            <th className="p-2 text-left">Team</th>
            <th className="p-2 text-center">W-L</th>
            <th className="p-2 text-center">Win %</th>
            <th className="p-2 text-center">+/-</th>
            <th className="p-2 text-center">Last 5</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team) => (
            <tr key={team["club.code"]} className="border-t hover:bg-gray-50">
              <td className="p-2">{team.position}</td>
              <td className="p-2 flex items-center gap-2">
                <img src={team["club.images.crest"]} alt={team["club.abbreviatedName"]} className="w-6 h-6" />
                {team["club.abbreviatedName"]}
              </td>
              <td className="p-2 text-center">{team.gamesWon}-{team.gamesLost}</td>
              <td className="p-2 text-center">{team.winPercentage}</td>
              <td className="p-2 text-center">{team.pointsDifference}</td>
              <td className="p-2 text-center flex justify-center gap-1">
                {team.last5Form.map((result, index) => (
                  <span
                    key={index}
                    className={`w-4 h-4 rounded-full ${
                      result === 'W' ? 'bg-green-500' : 'bg-red-500'
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
