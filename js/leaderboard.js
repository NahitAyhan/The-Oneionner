document.addEventListener("DOMContentLoaded", () => {
    fetchLeaderboard();
});

function fetchLeaderboard() {
    const listContainer = document.getElementById("leaderboardList");

    // PHP ENTEGRASYONU
    fetch('php/get_leaderboard.php')
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch data!");
            return response.json();
        })
        .then(data => {
            listContainer.innerHTML = ""; 

            data.forEach((player, index) => {
                const rank = index + 1;
                
                let extraClass = "";
                if (rank === 1) extraClass = "top1";
                else if (rank === 2) extraClass = "top2";
                else if (rank === 3) extraClass = "top3";

                const playerDiv = document.createElement("div");
                playerDiv.className = `player ${extraClass}`;
                
                // TC yerine Username gösteriliyor
                playerDiv.innerHTML = `
                    <span>#${rank}</span>
                    <span>${player.USERNAME}</span>
                    <span>${player.TOTAL_SCORE}</span>
                `;

                listContainer.appendChild(playerDiv);
            });
        })
        .catch(error => {
            console.error(error);
            listContainer.innerHTML = "<p style='color:red;'>Failed to load leaderboard.</p>";
        });
}