import React, { useEffect, useState } from "react";

const ScheduledMatches = () => {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    fetch("/api/scheduled_matches")
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
      <h2 className="text-xl font-bold mb-4">Upcoming EuroLeague Matches</h2>
      <ul className="space-y-4">
        {matches.length === 0 ? (
          <li className="text-gray-500">No matches available</li>
        ) : (
          matches.map((match, index) => (
            <li
              key={index}
              className="flex flex-col md:flex-row items-center justify-between border-b border-gray-300 pb-2"
            >
              <div className="text-center w-full md:w-1/3">
                <span className="block text-sm font-medium break-words">
                  {match.home_team}
                </span>
              </div>

              <div className="w-full md:w-1/3 text-center text-gray-500 font-semibold py-1">
                vs
              </div>

              <div className="text-center w-full md:w-1/3">
                <span className="block text-sm font-medium break-words">
                  {match.away_team}
                </span>
              </div>

              <div className="mt-2 text-center w-full text-sm text-gray-600 md:hidden">
                {formatDateTime(match.datetime)}
              </div>
              <div className="hidden md:block text-sm text-gray-600 text-right mt-1 w-full">
                {formatDateTime(match.datetime)}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default ScheduledMatches;
