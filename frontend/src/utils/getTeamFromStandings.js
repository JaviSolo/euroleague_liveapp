// frontend/src/utils/getTeamFromStandings.js

const teamNameMap = {
    "FC Bayern Munich": ["FC Bayern Munich", "FC Bayern", "Bayern Munich"],
    "FC Barcelona": ["FC Barcelona", "Barcelona", "Barça"],
    "Real Madrid": ["Real Madrid"],
    // Agrega más equivalencias si ves errores
  };
  
  export const getTeamFromStandings = (teamName, standings) => {
    for (const [officialName, aliases] of Object.entries(teamNameMap)) {
      if (aliases.some(alias => teamName.toLowerCase().includes(alias.toLowerCase()))) {
        return standings.find(
          (team) => team["club.name"].toLowerCase() === officialName.toLowerCase()
        );
      }
    }
  
    // Si no se encuentra en el map, intentar buscar por nombre completo
    return standings.find(
      (team) => team["club.name"].toLowerCase() === teamName.toLowerCase()
    );
  };
  