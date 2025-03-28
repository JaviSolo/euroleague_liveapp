import React from "react";

const MatchCard = ({ home, away, score, status }) => {
  return (
    <div className="bg-gray-700 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 duration-300 border border-gray-600">
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-6">
          {home}
          <span className="text-gray-400 text-sm font-medium">vs</span>
          {away}
        </div>
        <p className="text-xs text-gray-400 mt-2 uppercase tracking-widest">{status}</p>
      </div>
      <p className="text-xl font-semibold text-center text-white">{score}</p>
    </div>
  );
};

export default MatchCard;
