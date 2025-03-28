// frontend/src/components/TeamDisplay.jsx
import React from "react";

const TeamDisplay = ({ team, fallback }) => {
  if (!team) {
    return <span className="text-white font-medium">{fallback}</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <img
        src={team["club.images.crest"]}
        alt={team["club.name"]}
        className="w-6 h-6"
      />
      <span className="text-white font-medium">{team["club.name"]}</span>
    </div>
  );
};

export default TeamDisplay;
