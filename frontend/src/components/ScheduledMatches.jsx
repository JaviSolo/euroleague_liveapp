import React, { useEffect, useState } from "react";

const ScheduledMatches = () => {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/scheduled_matches")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => setMatches(data))
      .catch((err) => {
        console.error("Error fetching scheduled matches:", err);
        setMatches([]);
      });
  }, []);

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
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Upcoming EuroLeague Matches</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.length === 0 ? (
          <p className="text-gray-500 text-center">No upcoming matches available</p>
        ) : (
          matches.map((match, index) => (
            <div
              key={index}
              className="bg-gray-200 p-4 rounded-lg shadow-md hover:shadow-xl transition duration-200"
            >
              <div className="text-center mb-4">
                <h3 className="font-semibold text-xl text-gray-700">{match.home_team} vs {match.away_team}</h3>
                <p className="text-sm text-gray-600">{formatDateTime(match.datetime)}</p>
                <p className="text-sm text-gray-600">{match.arena}</p>
              </div>
              <div className="text-lg font-bold text-center text-gray-700">
                {/* Here we are showing "TBA" for upcoming matches */}
                <span className="text-gray-500">Scheduled</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ScheduledMatches;
