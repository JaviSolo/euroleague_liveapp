// Ejecuta la carga de partidos en vivo al cargar la página
// y establece un intervalo para recargar cada 10 segundos

document.addEventListener("DOMContentLoaded", function () {
    fetchLiveMatches();
    setInterval(fetchLiveMatches, 10000); // Actualizar cada 10 segundos
});

let currentDetailURL = null;
let currentDetailTeams = null;    
let detailInterval = null;

// Obtiene los partidos en vivo desde el backend y los muestra como tarjetas individuales
function fetchLiveMatches() {
    fetch("/api/live_matches")
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById("matches-container");
            if (!container) return;
            container.innerHTML = "";

            // Para cada partido, crear una tarjeta visual (match-card)
            data.forEach(match => {
                const card = document.createElement("div");
                card.classList.add("match-card");

                // Subcaja para marcador y estado actual
                const infoBox = document.createElement("div");
                infoBox.classList.add("match-info");
                infoBox.innerHTML = `
                    <p><strong>${match.team1}</strong> <span style="font-size: 1.8em; font-weight: bold; margin: 0 10px;">${match.score}</span> <strong>${match.team2}</strong></p>
                    <p>${match.quarter} ${match.time}'</p
                `;
                card.appendChild(infoBox);

                // Botón para ver detalles
                const buttonBox = document.createElement("div");
                buttonBox.classList.add("details-button");
                const button = document.createElement("button");
                button.textContent = "View Details";
                button.onclick = () => fetchMatchDetails(match.url, match.team1, match.team2);
                buttonBox.appendChild(button);
                card.appendChild(buttonBox);

                // Agregar tarjeta al contenedor principal
                container.appendChild(card);
            });
        })
        .catch(error => console.error("Error fetching live matches:", error));
}

// Inicia o reinicia el intervalo para actualizar los detalles
function fetchMatchDetails(url, team1, team2) {
    currentDetailURL = url;
    currentDetailTeams = { team1, team2 };

    if (detailInterval) clearInterval(detailInterval);
    loadMatchDetails(url, team1, team2);

    detailInterval = setInterval(() => {
        loadMatchDetails(currentDetailURL, currentDetailTeams.team1, currentDetailTeams.team2);
    }, 10000);
}

// Carga los detalles de un partido (actualizable)
function loadMatchDetails(url, team1, team2) {
    fetch(`/api/match_details?url=${encodeURIComponent(url)}`)
        .then(response => response.json())
        .then(data => {
            const matchDetails = document.getElementById("match-details");
            matchDetails.classList.remove("hidden");
            matchDetails.innerHTML = "";

            const detailBox = document.createElement("div");
            detailBox.classList.add("match-detail-box");

            const title = document.createElement("h2");
            title.textContent = "Match Details";
            detailBox.appendChild(title);

            const quarterBox = document.createElement("div");
            quarterBox.classList.add("details-section");
            const quarterTitle = document.createElement("h3");
            quarterTitle.textContent = "Points by Quarter";
            quarterBox.appendChild(quarterTitle);

            const scoreTable = document.createElement("table");
            scoreTable.innerHTML = `
                <thead>
                    <tr>
                        <th></th>
                        <th>1st</th>
                        <th>2nd</th>
                        <th>3rd</th>
                        <th>4th</th>
                        <th>OT</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${team1}</td>
                        <td>${data.home_quarter_scores[0]}</td>
                        <td>${data.home_quarter_scores[1]}</td>
                        <td>${data.home_quarter_scores[2]}</td>
                        <td>${data.home_quarter_scores[3]}</td>
                        <td>${data.home_quarter_scores[4]}</td>
                        <td>${data.home_total}</td>
                    </tr>
                    <tr>
                        <td>${team2}</td>
                        <td>${data.away_quarter_scores[0]}</td>
                        <td>${data.away_quarter_scores[1]}</td>
                        <td>${data.away_quarter_scores[2]}</td>
                        <td>${data.away_quarter_scores[3]}</td>
                        <td>${data.away_quarter_scores[4]}</td>
                        <td>${data.away_total}</td>
                    </tr>
                </tbody>
            `;
            quarterBox.appendChild(scoreTable);
            detailBox.appendChild(quarterBox);

            const topBox = document.createElement("div");
            topBox.classList.add("details-section");
            const topTitle = document.createElement("h3");
            topTitle.textContent = "Top 3 Players";
            topBox.appendChild(topTitle);

            const topPlayersTable = document.createElement("table");
            const topPlayersBody = document.createElement("tbody");

            if (!data.top_player_stats || data.top_player_stats === "Not found" || data.top_player_stats.length === 0) {
                const row = document.createElement("tr");
                row.innerHTML = `<td colspan="3">No hay estadísticas de jugadores disponibles para este partido.</td>`;
                topPlayersBody.appendChild(row);
            } else {
                topPlayersTable.innerHTML = `
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Team</th>
                            <th>Points</th>
                        </tr>
                    </thead>
                `;
                data.top_player_stats.forEach(player => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${player.name}</td>
                        <td>${player.team}</td>
                        <td>${player.points}</td>
                    `;
                    topPlayersBody.appendChild(row);
                });
            }

            topPlayersTable.appendChild(topPlayersBody);
            topBox.appendChild(topPlayersTable);
            detailBox.appendChild(topBox);

            matchDetails.appendChild(detailBox);
        })
        .catch(error => console.error("Error fetching match details:", error));
}
