document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed."); // Debugging
    fetchLiveMatches(); // Initial fetch
    setInterval(fetchLiveMatches, 10000); // Refresh every 10 seconds
});

function fetchLiveMatches() {
    fetch("/api/live_matches")
        .then(response => response.json())
        .then(data => {
            console.log("Fetched live matches:", data); // Debugging
            const container = document.getElementById("matches-container");
            console.log("Matches container element:", container); // Debugging
            
            if (!container) {
                console.error("matches-container not found in the DOM!");
                return;
            }
            
            container.innerHTML = ""; // Clear existing content

            data.forEach(match => {
                console.log("Inserting match:", match); // Debugging
                const matchDiv = document.createElement("div");
                matchDiv.classList.add("match-box");
                matchDiv.innerHTML = `
                    <p><strong>${match.team1}</strong> vs <strong>${match.team2}</strong></p>
                    <p>Score: ${match.score}</p>
                    <p>Quarter: ${match.quarter}</p>
                    <p>Time: ${match.time}</p>
                    <button onclick="fetchMatchDetails('${match.url}')">View Details</button>
                `;
                container.appendChild(matchDiv);
            });
        })
        .catch(error => console.error("Error fetching live matches:", error));
}

function fetchMatchDetails(url) {
    fetch(`/api/match_details?url=${encodeURIComponent(url)}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("match-details").classList.remove("hidden");
            
            // Update quarter scores table
            const scoreTable = document.getElementById("score-table").querySelector("tbody");
            scoreTable.innerHTML = ""; // Clear table
            
            // Create header row
            const headerRow = document.createElement("tr");
            headerRow.innerHTML = `
                <th></th>
                <th>1st</th>
                <th>2nd</th>
                <th>3rd</th>
                <th>4th</th>
                <th>OT</th>
                <th>Total</th>
            `;
            scoreTable.appendChild(headerRow);
            
            // Create home team row
            const homeRow = document.createElement("tr");
            homeRow.innerHTML = `
                <td>${data.home_team}</td>
                <td>${data.home_quarter_scores[0]}</td>
                <td>${data.home_quarter_scores[1]}</td>
                <td>${data.home_quarter_scores[2]}</td>
                <td>${data.home_quarter_scores[3]}</td>
                <td>${data.home_quarter_scores[4]}</td>
                <td>${data.home_total}</td>
            `;
            scoreTable.appendChild(homeRow);
            
            // Create away team row
            const awayRow = document.createElement("tr");
            awayRow.innerHTML = `
                <td>${data.away_team}</td>
                <td>${data.away_quarter_scores[0]}</td>
                <td>${data.away_quarter_scores[1]}</td>
                <td>${data.away_quarter_scores[2]}</td>
                <td>${data.away_quarter_scores[3]}</td>
                <td>${data.away_quarter_scores[4]}</td>
                <td>${data.away_total}</td>
            `;
            scoreTable.appendChild(awayRow);
            
            // Update top players
            const topPlayersTable = document.getElementById("top-players-table").querySelector("tbody");
            topPlayersTable.innerHTML = ""; // Clear list
            
            data.top_player_stats.forEach(player => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${player.name}</td>
                    <td>${player.team}</td>
                    <td>${player.points}</td>
                `;
                topPlayersTable.appendChild(row);
            });
        })
        .catch(error => console.error("Error fetching match details:", error));
}
