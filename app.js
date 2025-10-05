// Basketball Scouting App - Vollstaendig kompatible Version
class BasketballScoutingApp {
    constructor() {
        this.currentGame = null;
        this.currentPlayer = null;
        this.players = [];
        this.gameData = this.loadGameData();
        this.schedule = null;
        this.init();
    }

    init() {
        console.log('Basketball Scouting App wird initialisiert...');
        this.loadScheduleData();
        this.bindEvents();
        this.showScreen('gameSelectionScreen');
        this.initializeRatingCategories();
    }

    // Data Management
    loadGameData() {
        try {
            const saved = localStorage.getItem('basketballScoutingData');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('Fehler beim Laden der Spieldaten:', error);
            return {};
        }
    }

    saveGameData() {
        try {
            localStorage.setItem('basketballScoutingData', JSON.stringify(this.gameData));
            console.log('Spieldaten gespeichert');
        } catch (error) {
            console.error('Fehler beim Speichern:', error);
            alert('Fehler beim Speichern der Daten!');
        }
    }

    loadScheduleData() {
        this.schedule = {
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
                    "spielhalle": "Sporthalle Koenigswiesen"
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

        this.populateGameSelect(this.schedule.spiele);
    }

    populateGameSelect(games) {
        const select = document.getElementById('gameSelect');
        if (!select) {
            console.error('gameSelect Element nicht gefunden!');
            return;
        }

        // Clear existing options
        select.innerHTML = '<option value="">Spiel auswaehlen...</option>';

        games.forEach(game => {
            const option = document.createElement('option');
            option.value = JSON.stringify(game);
            option.textContent = game.datum + ' ' + game.uhrzeit + ' - ' + game.heimmannschaft + ' vs ' + game.gastmannschaft + ' (' + game.spielhalle + ')';
            select.appendChild(option);
        });
    }

    // Event Binding
    bindEvents() {
        console.log('Event-Handler werden registriert...');

        // Game Selection Events
        this.bindEventSafe('gameSelect', 'change', (e) => this.handleGameSelection(e));

        // Team Selection
        document.querySelectorAll('input[name="ownTeam"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.handleTeamSelection(e));
        });

        // Main Navigation Buttons
        this.bindEventSafe('startScoutingBtn', 'click', () => this.startScouting());
        this.bindEventSafe('manualGameBtn', 'click', () => this.showScreen('manualGameScreen'));

        // Manual Game Entry
        this.bindEventSafe('saveManualGame', 'click', () => this.saveManualGame());
        this.bindEventSafe('cancelManualGame', 'click', () => this.showScreen('gameSelectionScreen'));

        // Player Management
        this.bindEventSafe('addPlayerBtn', 'click', () => this.showPlayerRating());
        this.bindEventSafe('savePlayerRating', 'click', () => this.savePlayer());
        this.bindEventSafe('cancelRating', 'click', () => this.showScreen('playerOverviewScreen'));
        this.bindEventSafe('backToGameSelection', 'click', () => this.showScreen('gameSelectionScreen'));
        this.bindEventSafe('backToOverview', 'click', () => this.showScreen('playerOverviewScreen'));

        // Export Functions
        this.bindEventSafe('exportDataBtn', 'click', () => this.showScreen('exportScreen'));
        this.bindEventSafe('exportCurrentJSON', 'click', () => this.exportCurrentGame('json'));
        this.bindEventSafe('exportCurrentCSV', 'click', () => this.exportCurrentGame('csv'));
        this.bindEventSafe('exportAllJSON', 'click', () => this.exportAllGames('json'));
        this.bindEventSafe('exportAllCSV', 'click', () => this.exportAllGames('csv'));
        this.bindEventSafe('clearAllData', 'click', () => this.confirmClearAllData());

        // Confirmation Dialog
        this.bindEventSafe('confirmAction', 'click', () => this.handleConfirmation(true));
        this.bindEventSafe('cancelConfirmation', 'click', () => this.handleConfirmation(false));

        console.log('Event-Handler registriert');
    }

    bindEventSafe(elementId, eventType, handler) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener(eventType, handler);
            console.log('Event-Handler fuer ' + elementId + ' registriert');
        } else {
            console.warn('Element ' + elementId + ' nicht gefunden - Event-Handler uebersprungen');
        }
    }

    // Rating Categories
    initializeRatingCategories() {
        const container = document.getElementById('ratingCategories');
        if (!container) return;

        const categories = {
            'groesse': {
                name: 'Koerpergroesse (nur Info)',
                options: [
                    { value: 1, text: 'klein' },
                    { value: 2, text: 'normal' },
                    { value: 3, text: 'gross' }
                ],
                isInfo: true
            },
            'wurfqualitaet': {
                name: 'Wurfqualitaet',
                options: [
                    { value: 1, text: 'wirft nur aus der Not / trifft selten' },
                    { value: 2, text: 'kommt manchmal zum Korb / trifft gelegentlich' },
                    { value: 3, text: 'Dreier fallen oft / sehr treffsicher' }
                ]
            },
            'wurfhaeufigkeit': {
                name: 'Wie oft wirft er?',
                options: [
                    { value: 1, text: 'selten' },
                    { value: 2, text: 'immer wieder' },
                    { value: 3, text: 'oft' }
                ]
            },
            'schnelligkeit': {
                name: 'Schnelligkeit',
                options: [
                    { value: 1, text: 'eher lahm / leicht einzuholen' },
                    { value: 2, text: 'normales Tempo' },
                    { value: 3, text: 'schnell / zieht davon' }
                ]
            },
            'ballbehandlung': {
                name: 'Ballbehandlung / Dribbling',
                options: [
                    { value: 1, text: 'verliert oft den Ball / unsicher' },
                    { value: 2, text: 'solides Dribbling / ganz okay' },
                    { value: 3, text: 'sehr sicher am Ball / dribbelt gut' }
                ]
            },
            'passqualitaet': {
                name: 'Passqualitaet',
                options: [
                    { value: 1, text: 'passt selten / ungenaue Paesse' },
                    { value: 2, text: 'passt meistens / ganz okay' },
                    { value: 3, text: 'fast immer gute Paesse / sehr praezise' }
                ]
            },
            'ballbesitz': {
                name: 'Wie oft hat er den Ball?',
                options: [
                    { value: 1, text: 'selten' },
                    { value: 2, text: 'manchmal' },
                    { value: 3, text: 'sehr oft' }
                ]
            },
            'verteidigung': {
                name: 'Verteidigung',
                options: [
                    { value: 1, text: 'leicht zu umspielen / kommt man gut vorbei' },
                    { value: 2, text: 'steht schon ganz gut' },
                    { value: 3, text: 'klaut oft den Ball / sehr stark' }
                ]
            },
            'rebounding': {
                name: 'Rebounding',
                options: [
                    { value: 1, text: 'kaempft selten um den Ball' },
                    { value: 2, text: 'holt manchmal Rebounds' },
                    { value: 3, text: 'schnappt sich oft den Ball' }
                ]
            },
            'aktivitaet': {
                name: 'Wie aktiv ist er?',
                options: [
                    { value: 1, text: 'steht oft rum / wenig aktiv' },
                    { value: 2, text: 'normal aktiv' },
                    { value: 3, text: 'immer in Bewegung / sehr aktiv' }
                ]
            },
            'gefahr': {
                name: 'Wie gefaehrlich fuer unser Team?',
                options: [
                    { value: 1, text: 'kaum Gefahr / koennen wir ignorieren' },
                    { value: 2, text: 'sollten wir im Auge behalten' },
                    { value: 3, text: 'sehr gefaehrlich / unbedingt markieren!' }
                ]
            }
        };

        container.innerHTML = '';

        Object.entries(categories).forEach(([categoryId, category]) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'rating-category';
            categoryDiv.innerHTML = '<h3>' + category.name + '</h3><div class="rating-buttons" data-category="' + categoryId + '">' + 
                category.options.map(option => 
                    '<button type="button" class="rating-btn" data-value="' + option.value + '">' + option.text + '</button>'
                ).join('') + '</div>';
            container.appendChild(categoryDiv);
        });

        // Rating Button Event Handlers
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('rating-btn')) {
                this.handleRatingClick(e);
            }
        });
    }

    handleRatingClick(e) {
        const button = e.target;
        const container = button.closest('.rating-buttons');
        const category = container.dataset.category;
        const value = parseInt(button.dataset.value);

        // Clear other selections in this category
        container.querySelectorAll('.rating-btn').forEach(btn => 
            btn.classList.remove('selected'));

        // Select clicked button
        button.classList.add('selected');

        // Store in current player
        if (!this.currentPlayer) this.currentPlayer = {};
        this.currentPlayer[category] = value;

        console.log('Rating gesetzt: ' + category + ' = ' + value);
    }

    // Game Selection Logic
    handleGameSelection(e) {
        const selectedGame = e.target.value;
        if (selectedGame) {
            try {
                const game = JSON.parse(selectedGame);
                this.updateGameInfo(game);
                this.checkStartButton();
            } catch (error) {
                console.error('Fehler beim Parsen der Spieldaten:', error);
            }
        } else {
            const gameInfo = document.getElementById('selectedGameInfo');
            if (gameInfo) gameInfo.style.display = 'none';
            this.checkStartButton();
        }
    }

    handleTeamSelection(e) {
        this.checkStartButton();
        this.updateOpponentInfo();
    }

    updateGameInfo(game) {
        this.selectedGame = game;

        // Update game info display
        this.updateElementText('gameDateTime', game.datum + ' ' + game.uhrzeit);
        this.updateElementText('gameVenue', game.spielhalle);

        const gameInfo = document.getElementById('selectedGameInfo');
        if (gameInfo) gameInfo.style.display = 'block';

        this.updateOpponentInfo();
    }

    updateOpponentInfo() {
        if (!this.selectedGame) return;

        const ownTeamRadio = document.querySelector('input[name="ownTeam"]:checked');
        if (ownTeamRadio) {
            const ownTeam = ownTeamRadio.value;
            const ourTeam = ownTeam === 'home' ? this.selectedGame.heimmannschaft : this.selectedGame.gastmannschaft;
            const opponent = ownTeam === 'home' ? this.selectedGame.gastmannschaft : this.selectedGame.heimmannschaft;

            this.updateElementText('ourTeam', ourTeam);
            this.updateElementText('opponentTeam', opponent);
        }
    }

    updateElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        } else {
            console.warn('Element ' + elementId + ' nicht gefunden');
        }
    }

    checkStartButton() {
        const gameSelected = document.getElementById('gameSelect') && document.getElementById('gameSelect').value;
        const teamSelected = document.querySelector('input[name="ownTeam"]:checked');
        const startBtn = document.getElementById('startScoutingBtn');

        if (startBtn) {
            startBtn.disabled = !(gameSelected && teamSelected);
        }
    }

    // Screen Management
    showScreen(screenId) {
        console.log('Wechsel zu Screen: ' + screenId);

        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        } else {
            console.error('Screen ' + screenId + ' nicht gefunden!');
        }
    }

    // Player Management
    startScouting() {
        if (!this.selectedGame) {
            alert('Bitte waehlen Sie zunaechst ein Spiel aus');
            return;
        }

        const ownTeamRadio = document.querySelector('input[name="ownTeam"]:checked');
        if (!ownTeamRadio) {
            alert('Bitte waehlen Sie Ihr Team aus');
            return;
        }

        const gameData = this.selectedGame;
        const ownTeam = ownTeamRadio.value;

        this.currentGame = {
            spiel_nr: gameData.spiel_nr,
            datum: gameData.datum,
            uhrzeit: gameData.uhrzeit,
            heimmannschaft: gameData.heimmannschaft,
            gastmannschaft: gameData.gastmannschaft,
            spielhalle: gameData.spielhalle,
            ownTeam: ownTeam,
            ourTeamName: ownTeam === 'home' ? gameData.heimmannschaft : gameData.gastmannschaft,
            opponent: ownTeam === 'home' ? gameData.gastmannschaft : gameData.heimmannschaft,
            gameId: gameData.spiel_nr + '_' + Date.now()
        };

        // Load existing players for this game
        this.loadExistingPlayers();

        this.showScreen('playerOverviewScreen');
        this.updatePlayerOverview();
    }

    loadExistingPlayers() {
        const gameId = this.currentGame && this.currentGame.gameId;
        if (gameId && this.gameData[gameId]) {
            this.players = this.gameData[gameId].players || [];
        } else {
            this.players = [];
        }
        console.log(this.players.length + ' Spieler fuer dieses Spiel geladen');
    }

    updatePlayerOverview() {
        if (!this.currentGame) return;

        // Update header info
        const title = document.getElementById('playerRatingTitle');
        if (title) {
            title.textContent = this.currentGame.datum + ' - Scouting';
        }

        this.renderPlayersList();
    }

    renderPlayersList() {
        const container = document.getElementById('playersList');
        if (!container) return;

        if (this.players.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-icon">Basketball</div><h3>Noch keine Spieler bewertet</h3><p>Fuegen Sie den ersten Spieler hinzu, um mit dem Scouting zu beginnen</p></div>';
            return;
        }

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
        const sizeText = ['', 'klein', 'normal', 'gross'][player.groesse || 2];

        card.innerHTML = '<div class="player-header"><span class="player-number">#' + player.number + 
            '</span><span class="player-size">' + sizeText + 
            '</span><span class="player-average ' + avgClass + '">Durchschnitt ' + avgScore.toFixed(1) + 
            '</span></div><div class="player-actions"><button class="btn btn--small btn--secondary" onclick="window.app.editPlayer(' + index + 
            ')">Bearbeiten</button><button class="btn btn--small btn--danger" onclick="window.app.deletePlayer(' + index + 
            ')">Loeschen</button></div>';

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

        if (playerIndex !== null && playerIndex >= 0) {
            this.currentPlayer = Object.assign({}, this.players[playerIndex]);
            const title = document.getElementById('playerRatingTitle');
            if (title) title.textContent = 'Spieler #' + this.currentPlayer.number + ' bearbeiten';
        } else {
            this.currentPlayer = {};
            const title = document.getElementById('playerRatingTitle');
            if (title) title.textContent = 'Neuen Spieler bewerten';
        }

        this.loadPlayerData();
        this.showScreen('playerRatingScreen');
    }

    loadPlayerData() {
        // Load jersey number
        const numberInput = document.getElementById('jerseyNumber');
        if (numberInput) {
            numberInput.value = this.currentPlayer.number || '';
        }

        // Load all ratings
        document.querySelectorAll('.rating-buttons').forEach(container => {
            const category = container.dataset.category;
            const value = this.currentPlayer[category];

            // Clear previous selections
            container.querySelectorAll('.rating-btn').forEach(btn => 
                btn.classList.remove('selected'));

            // Set current selection
            if (value) {
                const selectedBtn = container.querySelector('[data-value="' + value + '"]');
                if (selectedBtn) {
                    selectedBtn.classList.add('selected');
                }
            }
        });
    }

    savePlayer() {
        const numberInput = document.getElementById('jerseyNumber');
        const number = parseInt(numberInput && numberInput.value);

        if (!number || number < 1 || number > 99) {
            alert('Bitte eine gueltige Trikotnummer (1-99) eingeben');
            return;
        }

        // Check for duplicate numbers
        const existingPlayerIndex = this.players.findIndex(p => p.number === number);
        if (existingPlayerIndex !== -1 && existingPlayerIndex !== this.currentPlayerIndex) {
            alert('Diese Trikotnummer ist bereits vergeben');
            return;
        }

        this.currentPlayer.number = number;
        this.currentPlayer.lastUpdated = new Date().toISOString();

        if (this.currentPlayerIndex !== null && this.currentPlayerIndex >= 0) {
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
        if (confirm('Moechten Sie Spieler #' + this.players[index].number + ' wirklich loeschen?')) {
            this.players.splice(index, 1);
            this.saveCurrentGameData();
            this.updatePlayerOverview();
        }
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

    // Manual Game Entry
    saveManualGame() {
        const ourTeam = document.getElementById('manualOurTeam') && document.getElementById('manualOurTeam').value.trim();
        const opponent = document.getElementById('manualOpponent') && document.getElementById('manualOpponent').value.trim();
        const date = document.getElementById('manualDate') && document.getElementById('manualDate').value;

        if (!ourTeam || !opponent || !date) {
            alert('Bitte alle Felder ausfuellen');
            return;
        }

        this.currentGame = {
            spiel_nr: 'manual_' + Date.now(),
            datum: date,
            uhrzeit: '00:00',
            heimmannschaft: ourTeam,
            gastmannschaft: opponent,
            spielhalle: 'Manuell eingegeben',
            ownTeam: 'home',
            ourTeamName: ourTeam,
            opponent: opponent,
            gameId: 'manual_' + Date.now()
        };

        this.players = [];
        this.showScreen('playerOverviewScreen');
        this.updatePlayerOverview();
    }

    // Export Functions
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

        const filename = 'scouting_' + this.currentGame.opponent + '_' + this.currentGame.datum;

        if (format === 'json') {
            this.downloadJSON(data, filename + '.json');
        } else {
            this.downloadCSV(data, filename + '.csv');
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
            this.downloadJSON(allData, 'basketball_scouting_alle_spiele.json');
        } else {
            this.downloadCSV(allData, 'basketball_scouting_alle_spiele.csv');
        }
    }

    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        this.downloadBlob(blob, filename);
    }

    downloadCSV(data, filename) {
        let csv = 'Spiel,Datum,Gegner,Spieler_Nr,Groesse,Wurf_Qualitaet,Wurf_Haeufigkeit,Schnelligkeit,Ballbehandlung,Pass_Qualitaet,Ballbesitz,Verteidigung,Rebounding,Aktivitaet,Gefahr,Durchschnitt\n';

        if (data.games) {
            // All games export
            Object.values(data.games).forEach(gameData => {
                gameData.players.forEach(player => {
                    const avg = this.calculateAverageScore(player);
                    csv += '"' + gameData.game.opponent + '","' + gameData.game.datum + '","' + gameData.game.opponent + '",' + 
                        player.number + ',' + (player.groesse || '') + ',' + (player.wurfqualitaet || '') + ',' + 
                        (player.wurfhaeufigkeit || '') + ',' + (player.schnelligkeit || '') + ',' + (player.ballbehandlung || '') + ',' + 
                        (player.passqualitaet || '') + ',' + (player.ballbesitz || '') + ',' + (player.verteidigung || '') + ',' + 
                        (player.rebounding || '') + ',' + (player.aktivitaet || '') + ',' + (player.gefahr || '') + ',' + 
                        avg.toFixed(1) + '\n';
                });
            });
        } else {
            // Single game export
            data.players.forEach(player => {
                const avg = this.calculateAverageScore(player);
                csv += '"' + data.game.opponent + '","' + data.game.datum + '","' + data.game.opponent + '",' + 
                    player.number + ',' + (player.groesse || '') + ',' + (player.wurfqualitaet || '') + ',' + 
                    (player.wurfhaeufigkeit || '') + ',' + (player.schnelligkeit || '') + ',' + (player.ballbehandlung || '') + ',' + 
                    (player.passqualitaet || '') + ',' + (player.ballbesitz || '') + ',' + (player.verteidigung || '') + ',' + 
                    (player.rebounding || '') + ',' + (player.aktivitaet || '') + ',' + (player.gefahr || '') + ',' + 
                    avg.toFixed(1) + '\n';
            });
        }

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        this.downloadBlob(blob, filename);
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Confirmation Dialog
    confirmClearAllData() {
        this.showConfirmation(
            'Moechten Sie wirklich alle gespeicherten Scouting-Daten loeschen? Diese Aktion kann nicht rueckgaengig gemacht werden!',
            () => {
                localStorage.removeItem('basketballScoutingData');
                this.gameData = {};
                this.players = [];
                this.currentGame = null;
                alert('Alle Daten wurden geloescht');
                this.showScreen('gameSelectionScreen');
            }
        );
    }

    showConfirmation(message, onConfirm) {
        const modal = document.getElementById('confirmationDialog');
        const messageEl = document.getElementById('confirmationMessage');

        if (modal && messageEl) {
            messageEl.textContent = message;
            modal.style.display = 'flex';
            this.pendingConfirmation = onConfirm;
        } else {
            // Fallback to browser confirm
            if (confirm(message)) {
                onConfirm();
            }
        }
    }

    handleConfirmation(confirmed) {
        const modal = document.getElementById('confirmationDialog');
        if (modal) {
            modal.style.display = 'none';
        }

        if (confirmed && this.pendingConfirmation) {
            this.pendingConfirmation();
        }

        this.pendingConfirmation = null;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Basketball Scouting App wird gestartet...');
    window.app = new BasketballScoutingApp();
});