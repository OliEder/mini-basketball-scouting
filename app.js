// Basketball Scouting App - JavaScript
class BasketballScoutingApp {
    constructor() {
        this.currentGame = null;
        this.currentPlayer = null;
        this.players = [];
        this.gameData = this.loadGameData();
        this.init();
    }

    init() {
        this.loadScheduleData();
        this.bindEvents();
        this.showScreen('gameSelectionScreen');
    }

    // Data Management
    loadGameData() {
        const saved = localStorage.getItem('basketballScoutingData');
        return saved ? JSON.parse(saved) : {};
    }

    saveGameData() {
        localStorage.setItem('basketballScoutingData', JSON.stringify(this.gameData));
    }

    loadScheduleData() {
        const schedule = {
            "liga_id": "51961",
            "liga_name": "U10 mixed Bezirksliga (U10 Oberpfalz)",
            "saison": "2024/2025",
            "spiele": [
                {
                    "spiel_nr": "1085",
                    "datum": "04.10.2025",
                    "uhrzeit": "11:00",
                    "heimmannschaft": "Fibalon Baskets Neumarkt",
                    "gastmannschaft": "DJK Neustadt a. d. Waldnaab 1",
                    "spielhalle": "Mittelschule West"
                },
                {
                    "spiel_nr": "1048",
                    "datum": "05.10.2025",
                    "uhrzeit": "14:00",
                    "heimmannschaft": "TSV 1880 Schwandorf",
                    "gastmannschaft": "Regensburg Baskets 2",
                    "spielhalle": "Oberpfalzhalle"
                },
                {
                    "spiel_nr": "1049",
                    "datum": "12.10.2025",
                    "uhrzeit": "12:00",
                    "heimmannschaft": "DJK Neustadt a. d. Waldnaab 1",
                    "gastmannschaft": "Regensburg Baskets 2",
                    "spielhalle": "Gymnasium"
                },
                {
                    "spiel_nr": "1090",
                    "datum": "18.10.2025",
                    "uhrzeit": "10:00",
                    "heimmannschaft": "TV Amberg-Sulzbach BSG 2",
                    "gastmannschaft": "Fibalon Baskets Neumarkt",
                    "spielhalle": "triMAX-Halle"
                },
                {
                    "spiel_nr": "1055",
                    "datum": "25.10.2025",
                    "uhrzeit": "10:00",
                    "heimmannschaft": "Regensburg Baskets 2",
                    "gastmannschaft": "Fibalon Baskets Neumarkt",
                    "spielhalle": "Sporthalle Königswiesen"
                },
                {
                    "spiel_nr": "1096",
                    "datum": "25.10.2025",
                    "uhrzeit": "11:00",
                    "heimmannschaft": "DJK Neustadt a. d. Waldnaab 1",
                    "gastmannschaft": "TV Amberg-Sulzbach BSG 2",
                    "spielhalle": "Gymnasium"
                },
                {
                    "spiel_nr": "1074",
                    "datum": "26.10.2025",
                    "uhrzeit": "10:00",
                    "heimmannschaft": "TV Amberg-Sulzbach BSG 2",
                    "gastmannschaft": "Regensburg Baskets 1",
                    "spielhalle": "triMAX-Halle"
                },
                {
                    "spiel_nr": "1087",
                    "datum": "26.10.2025",
                    "uhrzeit": "12:00",
                    "heimmannschaft": "TSV 1880 Schwandorf",
                    "gastmannschaft": "TB Weiden Basketball",
                    "spielhalle": "Oberpfalzhalle"
                }
            ]
        };

        this.populateGameSelect(schedule.spiele);
    }

    populateGameSelect(games) {
        const select = document.getElementById('gameSelect');
        select.innerHTML = '<option value="">Spiel auswählen...</option>';
        
        games.forEach(game => {
            const option = document.createElement('option');
            option.value = JSON.stringify(game);
            option.textContent = `${game.datum} ${game.uhrzeit} - ${game.heimmannschaft} vs ${game.gastmannschaft} (${game.spielhalle})`;
            select.appendChild(option);
        });
    }

    // Event Binding
    bindEvents() {
        // Game Selection
        document.getElementById('gameSelect').addEventListener('change', (e) => this.handleGameSelection(e));
        document.querySelectorAll('input[name="ownTeam"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.handleTeamSelection(e));
        });
        document.getElementById('startScoutingBtn').addEventListener('click', () => this.startScouting());
        document.getElementById('manualGameBtn').addEventListener('click', () => this.showManualGameModal());

        // Manual Game Modal
        document.getElementById('saveManualGameBtn').addEventListener('click', () => this.saveManualGame());
        document.getElementById('cancelManualGameBtn').addEventListener('click', () => this.hideManualGameModal());

        // Player Management
        document.getElementById('addPlayerBtn').addEventListener('click', () => this.showPlayerRating());
        document.getElementById('savePlayerBtn').addEventListener('click', () => this.savePlayer());
        document.getElementById('cancelRatingBtn').addEventListener('click', () => this.showScreen('playerOverviewScreen'));

        // Rating Buttons
        document.querySelectorAll('.rating-buttons').forEach(container => {
            container.addEventListener('click', (e) => this.handleRatingClick(e));
        });

        // Navigation
        document.querySelectorAll('.breadcrumb-item.clickable').forEach(item => {
            item.addEventListener('click', (e) => this.showScreen(e.target.dataset.screen));
        });

        // Export & History
        document.getElementById('exportBtn').addEventListener('click', () => this.showScreen('exportScreen'));
        document.getElementById('historyBtn').addEventListener('click', () => this.showHistoryData());
        document.getElementById('backToOverviewBtn').addEventListener('click', () => this.showScreen('playerOverviewScreen'));

        // Export buttons
        document.getElementById('exportCurrentJSON').addEventListener('click', () => this.exportCurrentGame('json'));
        document.getElementById('exportCurrentCSV').addEventListener('click', () => this.exportCurrentGame('csv'));
        document.getElementById('exportAllJSON').addEventListener('click', () => this.exportAllGames('json'));
        document.getElementById('exportAllCSV').addEventListener('click', () => this.exportAllGames('csv'));
        document.getElementById('clearAllDataBtn').addEventListener('click', () => this.confirmClearAllData());

        // Confirmation Modal
        document.getElementById('confirmYes').addEventListener('click', () => this.handleConfirmation(true));
        document.getElementById('confirmNo').addEventListener('click', () => this.handleConfirmation(false));
    }

    // Game Selection Logic
    handleGameSelection(e) {
        const selectedGame = e.target.value;
        if (selectedGame) {
            const game = JSON.parse(selectedGame);
            this.updateGameInfo(game);
            this.checkStartButton();
        } else {
            document.getElementById('selectedGameInfo').classList.add('hidden');
            this.checkStartButton();
        }
    }

    handleTeamSelection(e) {
        this.checkStartButton();
        this.updateOpponentInfo();
    }

    updateGameInfo(game) {
        document.getElementById('gameDateTime').textContent = `${game.datum} ${game.uhrzeit}`;
        document.getElementById('gameVenue').textContent = game.spielhalle;
        document.getElementById('selectedGameInfo').classList.remove('hidden');
        this.selectedGame = game;
        this.updateOpponentInfo();
    }

    updateOpponentInfo() {
        if (!this.selectedGame) return;

        const ownTeam = document.querySelector('input[name="ownTeam"]:checked')?.value;
        if (ownTeam) {
            const ourTeam = ownTeam === 'home' ? this.selectedGame.heimmannschaft : this.selectedGame.gastmannschaft;
            const opponent = ownTeam === 'home' ? this.selectedGame.gastmannschaft : this.selectedGame.heimmannschaft;
            
            document.getElementById('ourTeamName').textContent = ourTeam;
            document.getElementById('opponentTeamName').textContent = opponent;
        }
    }

    checkStartButton() {
        const gameSelected = document.getElementById('gameSelect').value;
        const teamSelected = document.querySelector('input[name="ownTeam"]:checked');
        document.getElementById('startScoutingBtn').disabled = !(gameSelected && teamSelected);
    }

    startScouting() {
        const gameData = JSON.parse(document.getElementById('gameSelect').value);
        const ownTeam = document.querySelector('input[name="ownTeam"]:checked').value;
        
        this.currentGame = {
            ...gameData,
            ownTeam: ownTeam,
            ourTeamName: ownTeam === 'home' ? gameData.heimmannschaft : gameData.gastmannschaft,
            opponent: ownTeam === 'home' ? gameData.gastmannschaft : gameData.heimmannschaft,
            gameId: `${gameData.spiel_nr}_${Date.now()}`
        };

        // Load existing players for this opponent if any
        this.loadExistingPlayers();
        
        this.showScreen('playerOverviewScreen');
        this.updatePlayerOverview();
    }

    loadExistingPlayers() {
        const gameId = this.currentGame?.gameId;
        if (gameId && this.gameData[gameId]) {
            this.players = this.gameData[gameId].players || [];
        } else {
            this.players = [];
        }
    }

    // Manual Game Input
    showManualGameModal() {
        document.getElementById('manualGameModal').classList.remove('hidden');
    }

    hideManualGameModal() {
        document.getElementById('manualGameModal').classList.add('hidden');
    }

    saveManualGame() {
        const ourTeam = document.getElementById('manualOurTeam').value.trim();
        const opponent = document.getElementById('manualOpponent').value.trim();
        const date = document.getElementById('manualDate').value;

        if (!ourTeam || !opponent || !date) {
            alert('Bitte alle Felder ausfüllen');
            return;
        }

        this.currentGame = {
            spiel_nr: `manual_${Date.now()}`,
            datum: date,
            uhrzeit: '00:00',
            heimmannschaft: ourTeam,
            gastmannschaft: opponent,
            spielhalle: 'Manuell eingegeben',
            ownTeam: 'home',
            ourTeamName: ourTeam,
            opponent: opponent,
            gameId: `manual_${Date.now()}`
        };

        this.players = [];
        this.hideManualGameModal();
        this.showScreen('playerOverviewScreen');
        this.updatePlayerOverview();
    }

    // Player Overview
    updatePlayerOverview() {
        document.getElementById('currentGameTitle').textContent = 
            `${this.currentGame.datum} - Scouting`;
        document.getElementById('currentOpponent').textContent = 
            `Gegner: ${this.currentGame.opponent}`;

        this.renderPlayersList();
    }

    renderPlayersList() {
        const container = document.getElementById('playersContainer');
        const emptyState = document.getElementById('emptyState');

        if (this.players.length === 0) {
            emptyState.style.display = 'block';
            container.innerHTML = '';
            container.appendChild(emptyState);
            return;
        }

        emptyState.style.display = 'none';
        container.innerHTML = '';

        this.players.forEach((player, index) => {
            const playerCard = this.createPlayerCard(player, index);
            container.appendChild(playerCard);
        });
    }

    createPlayerCard(player, index) {
        const card = document.createElement('div');
        card.className = 'player-card';
        
        const avgScore = this.calculateAverageScore(player);
        const avgClass = avgScore < 1.7 ? 'low' : avgScore > 2.3 ? 'high' : 'medium';
        const sizeText = ['', 'klein', 'normal', 'groß'][player.groesse || 2];

        card.innerHTML = `
            <div class="player-info">
                <div class="player-number">#${player.number}</div>
                <div class="player-details">
                    <span class="size-display">${sizeText}</span>
                    <span class="average-score ${avgClass}">⌀ ${avgScore.toFixed(1)}</span>
                </div>
            </div>
            <div class="player-actions">
                <button class="btn btn--sm btn--secondary" onclick="app.editPlayer(${index})">Bearbeiten</button>
                <button class="btn btn--sm btn--outline" onclick="app.deletePlayer(${index})">Löschen</button>
            </div>
        `;

        return card;
    }

    calculateAverageScore(player) {
        const ratingCategories = ['wurfqualitaet', 'wurfhaeufigkeit', 'schnelligkeit', 'ballbehandlung', 
                                 'passqualitaet', 'ballbesitz', 'verteidigung', 'rebounding', 'aktivitaet', 'gefahr'];
        
        let total = 0;
        let count = 0;
        
        ratingCategories.forEach(category => {
            if (player[category]) {
                total += player[category];
                count++;
            }
        });
        
        return count > 0 ? total / count : 0;
    }

    // Player Rating
    showPlayerRating(playerIndex = null) {
        this.currentPlayerIndex = playerIndex;
        
        if (playerIndex !== null) {
            this.currentPlayer = { ...this.players[playerIndex] };
            document.getElementById('playerRatingTitle').textContent = `Spieler #${this.currentPlayer.number} bearbeiten`;
        } else {
            this.currentPlayer = {};
            document.getElementById('playerRatingTitle').textContent = 'Neuen Spieler bewerten';
        }

        this.loadPlayerData();
        this.showScreen('playerRatingScreen');
    }

    loadPlayerData() {
        // Load player number
        document.getElementById('playerNumber').value = this.currentPlayer.number || '';

        // Load all ratings
        document.querySelectorAll('.rating-buttons').forEach(container => {
            const category = container.dataset.category;
            const value = this.currentPlayer[category];
            
            // Clear previous selections
            container.querySelectorAll('.rating-btn').forEach(btn => btn.classList.remove('selected'));
            
            // Set current selection
            if (value) {
                const selectedBtn = container.querySelector(`[data-value="${value}"]`);
                if (selectedBtn) {
                    selectedBtn.classList.add('selected');
                }
            }
        });
    }

    handleRatingClick(e) {
        if (!e.target.classList.contains('rating-btn')) return;

        const container = e.target.closest('.rating-buttons');
        const category = container.dataset.category;
        const value = parseInt(e.target.dataset.value);

        // Clear other selections in this category
        container.querySelectorAll('.rating-btn').forEach(btn => 
            btn.classList.remove('selected'));

        // Select clicked button
        e.target.classList.add('selected');

        // Store in current player
        this.currentPlayer[category] = value;
    }

    savePlayer() {
        const number = parseInt(document.getElementById('playerNumber').value);
        
        if (!number || number < 1 || number > 99) {
            alert('Bitte eine gültige Trikotnummer (1-99) eingeben');
            return;
        }

        // Check for duplicate numbers (except when editing the same player)
        const existingPlayerIndex = this.players.findIndex(p => p.number === number);
        if (existingPlayerIndex !== -1 && existingPlayerIndex !== this.currentPlayerIndex) {
            alert('Diese Trikotnummer ist bereits vergeben');
            return;
        }

        this.currentPlayer.number = number;
        this.currentPlayer.lastUpdated = new Date().toISOString();

        if (this.currentPlayerIndex !== null) {
            // Update existing player
            this.players[this.currentPlayerIndex] = this.currentPlayer;
        } else {
            // Add new player
            this.players.push(this.currentPlayer);
        }

        this.saveCurrentGameData();
        this.showScreen('playerOverviewScreen');
        this.updatePlayerOverview();
    }

    editPlayer(index) {
        this.showPlayerRating(index);
    }

    deletePlayer(index) {
        this.showConfirmation(
            'Spieler löschen',
            `Möchten Sie Spieler #${this.players[index].number} wirklich löschen?`,
            () => {
                this.players.splice(index, 1);
                this.saveCurrentGameData();
                this.updatePlayerOverview();
            }
        );
    }

    saveCurrentGameData() {
        if (!this.currentGame) return;
        
        this.gameData[this.currentGame.gameId] = {
            game: this.currentGame,
            players: this.players,
            lastUpdated: new Date().toISOString()
        };
        
        this.saveGameData();
    }

    // Export Functionality
    exportCurrentGame(format) {
        if (!this.currentGame || this.players.length === 0) {
            alert('Keine Daten zum Export vorhanden');
            return;
        }

        const data = {
            game: this.currentGame,
            players: this.players,
            exportDate: new Date().toISOString()
        };

        if (format === 'json') {
            this.downloadJSON(data, `scouting_${this.currentGame.opponent}_${this.currentGame.datum}.json`);
        } else {
            this.downloadCSV(data, `scouting_${this.currentGame.opponent}_${this.currentGame.datum}.csv`);
        }
    }

    exportAllGames(format) {
        if (Object.keys(this.gameData).length === 0) {
            alert('Keine gespeicherten Spiele vorhanden');
            return;
        }

        const allData = {
            games: this.gameData,
            exportDate: new Date().toISOString()
        };

        if (format === 'json') {
            this.downloadJSON(allData, `basketball_scouting_alle_spiele.json`);
        } else {
            this.downloadCSV(allData, `basketball_scouting_alle_spiele.csv`);
        }
    }

    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    downloadCSV(data, filename) {
        let csv = 'Spiel,Datum,Gegner,Spieler_Nr,Groesse,Wurf_Qualitaet,Wurf_Haeufigkeit,Schnelligkeit,Ballbehandlung,Pass_Qualitaet,Ballbesitz,Verteidigung,Rebounding,Aktivitaet,Gefahr,Durchschnitt\n';
        
        if (data.games) {
            // All games export
            Object.values(data.games).forEach(gameData => {
                gameData.players.forEach(player => {
                    const avg = this.calculateAverageScore(player);
                    csv += `"${gameData.game.opponent}","${gameData.game.datum}","${gameData.game.opponent}",${player.number},${player.groesse || ''},${player.wurfqualitaet || ''},${player.wurfhaeufigkeit || ''},${player.schnelligkeit || ''},${player.ballbehandlung || ''},${player.passqualitaet || ''},${player.ballbesitz || ''},${player.verteidigung || ''},${player.rebounding || ''},${player.aktivitaet || ''},${player.gefahr || ''},${avg.toFixed(1)}\n`;
                });
            });
        } else {
            // Single game export
            data.players.forEach(player => {
                const avg = this.calculateAverageScore(player);
                csv += `"${data.game.opponent}","${data.game.datum}","${data.game.opponent}",${player.number},${player.groesse || ''},${player.wurfqualitaet || ''},${player.wurfhaeufigkeit || ''},${player.schnelligkeit || ''},${player.ballbehandlung || ''},${player.passqualitaet || ''},${player.ballbesitz || ''},${player.verteidigung || ''},${player.rebounding || ''},${player.aktivitaet || ''},${player.gefahr || ''},${avg.toFixed(1)}\n`;
            });
        }

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    confirmClearAllData() {
        this.showConfirmation(
            'Alle Daten löschen',
            'Möchten Sie wirklich alle gespeicherten Scouting-Daten löschen? Diese Aktion kann nicht rückgängig gemacht werden!',
            () => {
                localStorage.removeItem('basketballScoutingData');
                this.gameData = {};
                this.players = [];
                this.currentGame = null;
                alert('Alle Daten wurden gelöscht');
                this.showScreen('gameSelectionScreen');
            }
        );
    }

    // History
    showHistoryData() {
        const games = Object.values(this.gameData);
        if (games.length === 0) {
            alert('Keine historischen Daten vorhanden');
            return;
        }

        let historyHTML = '<h2>Scouting-Historie</h2>';
        games.forEach(gameData => {
            historyHTML += `
                <div class="card" style="margin-bottom: 16px;">
                    <div class="card__header">
                        <h3>${gameData.game.datum} - ${gameData.game.opponent}</h3>
                    </div>
                    <div class="card__body">
                        <p><strong>Spieler bewertet:</strong> ${gameData.players.length}</p>
                        <p><strong>Letzte Aktualisierung:</strong> ${new Date(gameData.lastUpdated).toLocaleString('de-DE')}</p>
                    </div>
                </div>
            `;
        });

        // Create temporary modal for history
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                ${historyHTML}
                <button class="btn btn--primary btn--full-width" onclick="this.closest('.modal').remove()">Schließen</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // UI Helpers
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    showConfirmation(title, message, onConfirm) {
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmationModal').classList.remove('hidden');
        this.pendingConfirmation = onConfirm;
    }

    handleConfirmation(confirmed) {
        document.getElementById('confirmationModal').classList.add('hidden');
        if (confirmed && this.pendingConfirmation) {
            this.pendingConfirmation();
        }
        this.pendingConfirmation = null;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BasketballScoutingApp();
});