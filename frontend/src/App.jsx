// frontend/src/App.jsx
import React from "react";
import StandingsTable from "./components/StandingsTable";
import ScheduledMatches from "./components/ScheduledMatches";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Euroleague Dashboard</h1>
      <StandingsTable />
      <ScheduledMatches />
    </div>
  );
}

export default App;

