// Basketball Scouting App JavaScript

class BasketballScoutingApp {
    constructor() {
        this.players = [];
        this.currentEditingPlayer = null;
        this.categories = {
            "Offensive Fähigkeiten": [
                "Wurfgenauigkeit Korb",
                "Dreipunktwürfe",
                "Freiwürfe",
                "Schnelligkeit/Tempo",
                "Ballbehandlung"
            ],
            "Passspiel": [
                "Passgenauigkeit",
                "Spielübersicht",
                "Häufigkeit Pässe"
            ],
            "Defensive Fähigkeiten": [
                "Defensivverhalten",
                "Ballgewinne/Steals",
                "Rebounding"
            ],
            "Allgemeine Bewertung": [
                "Aktivität/Häufigkeit",
                "Konstanz",
                "Gefahr für unser Team"
            ]
        };
        
        this.ratingScale = {
            "1": "Schwach/Selten",
            "2": "Unterdurchschnittlich",
            "3": "Durchschnittlich",
            "4": "Überdurchschnittlich",
            "5": "Sehr stark/Häufig"
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.renderRatingCategories();
        this.renderPlayersList();
    }

    bindEvents() {
        // Navigation
        document.getElementById('add-player-btn').addEventListener('click', () => {
            this.showPlayerScreen();
        });

        document.getElementById('back-to-overview').addEventListener('click', () => {
            this.showOverviewScreen();
        });

        document.getElementById('back-from-summary').addEventListener('click', () => {
            this.showOverviewScreen();
        });

        document.getElementById('show-summary-btn').addEventListener('click', () => {
            this.showSummaryScreen();
        });

        // Save player
        document.getElementById('save-player').addEventListener('click', () => {
            this.savePlayer();
        });

        // Jersey number validation and Enter key handling
        document.getElementById('jersey-number').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            if (value < 0) e.target.value = 0;
            if (value > 99) e.target.value = 99;
        });

        document.getElementById('jersey-number').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.savePlayer();
            }
        });
    }

    showOverviewScreen() {
        this.hideAllScreens();
        document.getElementById('overview-screen').classList.add('active');
        this.currentEditingPlayer = null;
        this.clearPlayerForm();
        this.renderPlayersList();
    }

    showPlayerScreen(player = null) {
        this.hideAllScreens();
        document.getElementById('player-screen').classList.add('active');
        
        if (player) {
            this.currentEditingPlayer = player;
            document.getElementById('player-screen-title').textContent = `Spieler #${player.jerseyNumber} bearbeiten`;
            this.loadPlayerData(player);
        } else {
            this.currentEditingPlayer = null;
            document.getElementById('player-screen-title').textContent = 'Neuen Spieler bewerten';
            this.clearPlayerForm();
        }
    }

    showSummaryScreen() {
        this.hideAllScreens();
        document.getElementById('summary-screen').classList.add('active');
        this.renderSummary();
    }

    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
    }

    renderRatingCategories() {
        const container = document.querySelector('.rating-categories');
        container.innerHTML = '';

        Object.entries(this.categories).forEach(([categoryName, items]) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category-group';

            const categoryTitle = document.createElement('h3');
            categoryTitle.className = 'category-title';
            categoryTitle.textContent = categoryName;
            categoryDiv.appendChild(categoryTitle);

            items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'rating-item-full';

                const label = document.createElement('label');
                label.className = 'rating-label';
                label.textContent = item;
                itemDiv.appendChild(label);

                const buttonsDiv = document.createElement('div');
                buttonsDiv.className = 'rating-buttons';

                for (let i = 1; i <= 5; i++) {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = `rating-btn rating-btn--${i}`;
                    button.dataset.rating = i;
                    button.dataset.category = item;
                    button.textContent = i;
                    button.title = `${i} - ${this.ratingScale[i]}`;
                    
                    button.addEventListener('click', (e) => {
                        this.selectRating(e.target);
                    });

                    buttonsDiv.appendChild(button);
                }

                itemDiv.appendChild(buttonsDiv);
                categoryDiv.appendChild(itemDiv);
            });

            container.appendChild(categoryDiv);
        });
    }

    selectRating(button) {
        const category = button.dataset.category;
        const rating = button.dataset.rating;

        // Remove selection from other buttons in same category
        document.querySelectorAll(`[data-category="${category}"]`).forEach(btn => {
            btn.classList.remove('selected');
        });

        // Add selection to clicked button
        button.classList.add('selected');
    }

    loadPlayerData(player) {
        document.getElementById('jersey-number').value = player.jerseyNumber;

        // Clear all previous selections first
        document.querySelectorAll('.rating-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Load ratings
        Object.entries(player.ratings).forEach(([category, rating]) => {
            const button = document.querySelector(`[data-category="${category}"][data-rating="${rating}"]`);
            if (button) {
                button.classList.add('selected');
            }
        });
    }

    clearPlayerForm() {
        document.getElementById('jersey-number').value = '';
        document.querySelectorAll('.rating-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
    }

    savePlayer() {
        const jerseyNumber = document.getElementById('jersey-number').value;
        
        if (!jerseyNumber || jerseyNumber < 0 || jerseyNumber > 99) {
            alert('Bitte geben Sie eine gültige Trikotnummer (0-99) ein.');
            return;
        }

        // Check if jersey number already exists (and not editing current player)
        const existingPlayer = this.players.find(p => 
            p.jerseyNumber === jerseyNumber && p !== this.currentEditingPlayer
        );
        if (existingPlayer) {
            alert('Diese Trikotnummer wurde bereits bewertet. Wählen Sie sie aus der Liste aus, um sie zu bearbeiten.');
            return;
        }

        // Collect ratings
        const ratings = {};
        document.querySelectorAll('.rating-btn.selected').forEach(btn => {
            const category = btn.dataset.category;
            const rating = parseInt(btn.dataset.rating);
            ratings[category] = rating;
        });

        if (Object.keys(ratings).length === 0) {
            alert('Bitte bewerten Sie mindestens eine Kategorie.');
            return;
        }

        if (this.currentEditingPlayer) {
            // Update existing player
            const playerIndex = this.players.findIndex(p => p === this.currentEditingPlayer);
            if (playerIndex !== -1) {
                this.players[playerIndex] = {
                    ...this.currentEditingPlayer,
                    jerseyNumber: jerseyNumber,
                    ratings: ratings,
                    lastUpdated: new Date()
                };
            }
        } else {
            // Add new player
            const newPlayer = {
                id: Date.now(),
                jerseyNumber: jerseyNumber,
                ratings: ratings,
                createdAt: new Date(),
                lastUpdated: new Date()
            };
            this.players.push(newPlayer);
        }

        this.showOverviewScreen();
    }

    renderPlayersList() {
        const container = document.getElementById('players-list');
        
        if (this.players.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Noch keine Spieler bewertet</p>
                    <p class="empty-state-sub">Fügen Sie den ersten Spieler hinzu</p>
                </div>
            `;
            return;
        }

        // Sort players by jersey number
        const sortedPlayers = [...this.players].sort((a, b) => 
            parseInt(a.jerseyNumber) - parseInt(b.jerseyNumber)
        );

        container.innerHTML = '';
        sortedPlayers.forEach(player => {
            const playerCard = this.createPlayerCard(player);
            container.appendChild(playerCard);
        });
    }

    createPlayerCard(player) {
        const card = document.createElement('div');
        card.className = 'player-card';
        card.tabIndex = 0;
        card.addEventListener('click', () => this.showPlayerScreen(player));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.showPlayerScreen(player);
            }
        });

        const header = document.createElement('div');
        header.className = 'player-header';

        const jerseyNumber = document.createElement('span');
        jerseyNumber.className = 'jersey-number';
        jerseyNumber.textContent = `#${player.jerseyNumber}`;

        const avgRating = this.calculateAverageRating(player.ratings);
        const avgElement = document.createElement('span');
        avgElement.className = 'average-rating';
        avgElement.textContent = `⌀ ${avgRating.toFixed(1)}`;

        header.appendChild(jerseyNumber);
        header.appendChild(avgElement);

        const ratingsDiv = document.createElement('div');
        ratingsDiv.className = 'rating-summary';

        // Show top 4 ratings
        const ratingEntries = Object.entries(player.ratings)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 4);

        ratingEntries.forEach(([category, rating]) => {
            const item = document.createElement('div');
            item.className = 'rating-item';

            const label = document.createElement('span');
            label.textContent = category;

            const value = document.createElement('span');
            value.className = `rating-value rating-value--${rating}`;
            value.textContent = rating;

            item.appendChild(label);
            item.appendChild(value);
            ratingsDiv.appendChild(item);
        });

        card.appendChild(header);
        card.appendChild(ratingsDiv);

        return card;
    }

    calculateAverageRating(ratings) {
        const values = Object.values(ratings);
        return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    }

    renderSummary() {
        const container = document.getElementById('summary-content');
        
        if (this.players.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Keine Daten für Zusammenfassung</p>
                    <p class="empty-state-sub">Bewerten Sie zuerst einige Spieler</p>
                </div>
            `;
            return;
        }

        // Sort players by average rating (descending)
        const sortedPlayers = [...this.players].sort((a, b) => 
            this.calculateAverageRating(b.ratings) - this.calculateAverageRating(a.ratings)
        );

        container.innerHTML = '';
        sortedPlayers.forEach(player => {
            const playerSummary = this.createPlayerSummary(player);
            container.appendChild(playerSummary);
        });
    }

    createPlayerSummary(player) {
        const div = document.createElement('div');
        div.className = 'summary-player';

        const header = document.createElement('div');
        header.className = 'summary-player-header';

        const jersey = document.createElement('span');
        jersey.className = 'summary-jersey';
        jersey.textContent = `#${player.jerseyNumber}`;

        const avg = document.createElement('span');
        avg.className = 'average-rating';
        avg.textContent = `⌀ ${this.calculateAverageRating(player.ratings).toFixed(1)}`;

        header.appendChild(jersey);
        header.appendChild(avg);

        const categoriesDiv = document.createElement('div');
        categoriesDiv.className = 'summary-categories';

        Object.entries(this.categories).forEach(([categoryName, items]) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'summary-category';

            const title = document.createElement('div');
            title.className = 'summary-category-title';
            title.textContent = categoryName;

            const ratingsDiv = document.createElement('div');
            ratingsDiv.className = 'summary-ratings';

            items.forEach(item => {
                if (player.ratings[item] !== undefined) {
                    const ratingItem = document.createElement('div');
                    ratingItem.className = 'summary-rating-item';

                    const label = document.createElement('span');
                    label.textContent = item;

                    const value = document.createElement('span');
                    value.className = `rating-value rating-value--${player.ratings[item]}`;
                    value.textContent = player.ratings[item];

                    ratingItem.appendChild(label);
                    ratingItem.appendChild(value);
                    ratingsDiv.appendChild(ratingItem);
                }
            });

            if (ratingsDiv.children.length > 0) {
                categoryDiv.appendChild(title);
                categoryDiv.appendChild(ratingsDiv);
                categoriesDiv.appendChild(categoryDiv);
            }
        });

        div.appendChild(header);
        div.appendChild(categoriesDiv);

        return div;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BasketballScoutingApp();
});