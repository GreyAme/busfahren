/**
 * Busfahren - Trinkspiel
 * Ein interaktives Einzelspieler-Trinkspiel mit Fragerunde und Busfahr-Pyramide
 * Vorbereitet für Online-Mehrspielermodus
 */

// Entferne alle ausgelagerten Funktions- und State-Definitionen aus script.js
// Nur Initialisierung und Event-Binding bleibt hier

document.addEventListener('DOMContentLoaded', () => {
    // Mode-Selector und Lobby-Elemente
    const modeSelectContainer = document.getElementById('modeSelectContainer');
    const lobbyContainer = document.getElementById('lobbyContainer');
    const offlineBtn = document.getElementById('offlineModeBtn');
    const playerNameInput = document.getElementById('playerNameInput');
    const addPlayerBtn = document.getElementById('addPlayerBtn');
    const removePlayerBtn = document.getElementById('removePlayerBtn');
    const playersList = document.getElementById('playersList');
    const startGameBtn = document.getElementById('startGameBtn');

    // Fragerunde-Elemente
    const questionScreen = document.getElementById('questionScreen');
    const questionText = document.getElementById('questionText');
    const btnRed = document.getElementById('btnRed');
    const btnBlack = document.getElementById('btnBlack');
    const btnHigher = document.getElementById('btnHigher');
    const btnLower = document.getElementById('btnLower');
    const btnEqual = document.getElementById('btnEqual');
    const btnInside = document.getElementById('btnInside');
    const btnOutside = document.getElementById('btnOutside');
    const cardReveal = document.getElementById('cardReveal');
    const questionFeedback = document.getElementById('questionFeedback');
    const cardFlip = document.getElementById('cardFlip');
    const cardFront = cardFlip ? cardFlip.querySelector('.card-front') : null;
    const cardBack = cardFlip ? cardFlip.querySelector('.card-back') : null;
    const btnHerz = document.getElementById('btnHerz');
    const btnPik = document.getElementById('btnPik');
    const btnKreuz = document.getElementById('btnKreuz');
    const btnKaro = document.getElementById('btnKaro');
    const startPyramidBtn = document.getElementById('startPyramidBtn');

    let players = [];
    let currentCard = null;
    let currentPlayerIdx = 0;
    let currentRound = 0;
    const questions = [
        { text: 'Rot oder Schwarz?', type: 'color' },
        { text: 'Höher oder Tiefer?', type: 'highlow' },
        { text: 'Innerhalb oder Außerhalb?', type: 'insideoutside' },
        { text: 'Welches Symbol?', type: 'symbol' },
        // Weitere Fragen können hier ergänzt werden
    ];
    const playerHandDiv = document.getElementById('playerHand');
    const playersListLobby = document.getElementById('playersListLobby');
    const playersListGame = document.getElementById('playersListGame');
    const playersListPyramid = document.getElementById('playersListPyramid');
    const pyramidScreen = document.getElementById('pyramidScreen');
    const pyramidContainer = document.getElementById('pyramidContainer');

    let pyramidState = [];
    let activePyramidCard = null;
    const startBusfahrenBtn = document.getElementById('startBusfahrenBtn');
    const busfahrenScreen = document.getElementById('busfahrenScreen');
    const busfahrenContent = document.getElementById('busfahrenContent');
    const playersListBusfahren = document.getElementById('playersListBusfahren');
    let busfahrerIdx = null;

    // Zeige Lobby nach Klick auf OFFLINE
    if (offlineBtn) {
        offlineBtn.addEventListener('click', function() {
            if (modeSelectContainer) modeSelectContainer.style.display = 'none';
            if (lobbyContainer) lobbyContainer.style.display = 'flex';
        });
    }

    // Spieler hinzufügen
    if (addPlayerBtn) {
        addPlayerBtn.addEventListener('click', () => {
            const name = playerNameInput.value.trim();
            if (name && !players.some(p => p.name === name)) {
                players.push({ name, hand: [], avatar: selectedAvatar });
                playerNameInput.value = '';
                renderPlayers();
            }
        });
    }
    // Spieler entfernen (letzten)
    if (removePlayerBtn) {
        removePlayerBtn.addEventListener('click', () => {
            players.pop();
            renderPlayers();
        });
    }
    // 'Spiel starten' Button aktivieren/deaktivieren
    function renderPlayerHand() {
        if (!playerHandDiv) return;
        playerHandDiv.innerHTML = '';
        if (!players[currentPlayerIdx]) return;
        players[currentPlayerIdx].hand.forEach(card => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'player-hand-card ' + ((card.suit === '♥' || card.suit === '♦') ? 'red' : 'black');
            cardDiv.innerHTML = `<span>${card.value}</span><span class="card-symbol">${card.suit}</span>`;
            playerHandDiv.appendChild(cardDiv);
        });
        // Animation für die letzte Karte
        if (playerHandDiv.lastChild) {
            playerHandDiv.lastChild.classList.add('animate-move');
            setTimeout(() => playerHandDiv.lastChild.classList.remove('animate-move'), 700);
        }
    }
    // --- Lobby-Atmosphäre: Avatare, animierter Toast, Sprüche ---
    // Entferne renderLobbyAvatars und alle Emoji-Avatar-Visualisierungen
    // Die Avatare werden jetzt nur noch über das Auswahlmenü und die PNGs angezeigt
    const lobbyToast = document.getElementById('lobbyToast');
    const lobbyToasts = [
        'Auf einen feuchtfröhlichen Abend!',
        'Wer trinkt, verliert – oder gewinnt?',
        'Prost! 🍻',
        'Let the games beGIN! 🍸',
        'Wer lacht, trinkt!',
        'Heute wird Geschichte geschrieben – oder vergessen!',
        'Trinkpausen sind was für Anfänger!',
        'Cheers! 🥂',
        'Wer zuletzt trinkt, hat verloren!',
        'Möge der Durst mit euch sein!'
    ];
    const avatarEmojis = ['🍻','🍺','🍹','🍷','🥃','🍸','🍾','🥂','🧃','🍶','🧉','🍋'];
    // Toast-Rotation
    let toastInterval = null;
    function startLobbyToastRotation() {
        if (!lobbyToast) return;
        let lastIdx = -1;
        toastInterval = setInterval(() => {
            let idx;
            do { idx = Math.floor(Math.random() * lobbyToasts.length); } while (idx === lastIdx);
            lastIdx = idx;
            lobbyToast.textContent = lobbyToasts[idx];
            lobbyToast.classList.remove('arcade-toast');
            void lobbyToast.offsetWidth; // Trigger reflow for animation
            lobbyToast.classList.add('arcade-toast');
        }, 5000);
    }
    // Patch renderPlayers, addPlayerBtn, removePlayerBtn, etc. damit Avatare und Toast immer aktuell sind
    function renderPlayers() {
        [playersListLobby, playersListGame, playersListPyramid].forEach(playersList => {
            if (!playersList) return;
            playersList.innerHTML = '';
            players.forEach((player, idx) => {
                const li = document.createElement('li');
                li.className = 'player-list-item';
                // Avatarblock
                const avatarBlock = document.createElement('div');
                avatarBlock.className = 'player-list-avatarblock';
                if (player.avatar) {
                    const img = document.createElement('img');
                    img.src = `images/avatars/${player.avatar}`;
                    img.alt = 'Avatar';
                    avatarBlock.appendChild(img);
                }
                const nameDiv = document.createElement('div');
                nameDiv.className = 'player-list-name';
                nameDiv.textContent = player.name;
                avatarBlock.appendChild(nameDiv);
                li.appendChild(avatarBlock);
                // Handkarten
                const cardsSpan = document.createElement('span');
                cardsSpan.className = 'player-cards';
                player.hand.forEach(card => {
                    const cardDiv = document.createElement('div');
                    cardDiv.className = 'player-hand-card ' + ((card.suit === '♥' || card.suit === '♦') ? 'red' : 'black');
                    cardDiv.style.width = '22px';
                    cardDiv.style.height = '33px';
                    cardDiv.style.fontSize = '0.7rem';
                    cardDiv.innerHTML = `<span>${card.value}</span><span class="card-symbol">${card.suit}</span>`;
                    cardsSpan.appendChild(cardDiv);
                });
                li.appendChild(cardsSpan);
                playersList.appendChild(li);
            });
        });
        startGameBtn.disabled = players.length < 2;
        startGameBtn.style.opacity = players.length < 2 ? '0.5' : '1';
        // Entferne renderLobbyAvatars();
    }
    // Starte Toast-Rotation beim Betreten der Lobby
    if (lobbyContainer) {
        const observer = new MutationObserver(() => {
            if (lobbyContainer.style.display !== 'none') {
                // Entferne renderLobbyAvatars();
                startLobbyToastRotation();
            } else {
                if (toastInterval) clearInterval(toastInterval);
            }
        });
        observer.observe(lobbyContainer, { attributes: true, attributeFilter: ['style'] });
    }
    function renderCurrentPlayerInfo() {
        const questionTitle = document.getElementById('questionTitle');
        if (questionTitle && players[currentPlayerIdx]) {
            questionTitle.innerHTML = `Fragerunde<br><span style='font-size:1.1rem;font-weight:400;'>${players[currentPlayerIdx].name} ist dran</span>`;
        }
    }
    // Initial deaktivieren
    if (startGameBtn) {
        startGameBtn.disabled = true;
        startGameBtn.style.opacity = '0.5';
    }

    // --- Fragerunde Logik ---
    if (startGameBtn) {
        startGameBtn.addEventListener('click', () => {
            if (lobbyContainer) lobbyContainer.style.display = 'none';
            if (gameScreen) gameScreen.style.display = 'none';
            if (questionScreen) {
                questionScreen.style.display = 'block';
                startFirstQuestion();
            }
        });
    }

    function startFirstQuestion() {
        currentRound = 0;
        currentPlayerIdx = 0;
        renderQuestionRules();
        startCurrentQuestion();
    }
    function renderQuestionRules() {
        const rules = [
            '<b>Fragerunden – Regeln:</b>',
            'Jeder Spieler beantwortet nacheinander die Frage und zieht eine Karte.',
            'Bei richtiger Antwort: Nichts passiert!',
            'Bei falscher Antwort: <b>Trinken!</b> 🍻',
            'Die gezogene Karte bleibt in deiner Hand und wird für die nächsten Runden benötigt.',
            'Nach vier Fragerunden beginnt die Pyramidenphase.'
        ];
        const rulesList = document.getElementById('questionRules');
        if (rulesList) {
            rulesList.innerHTML = '';
            rules.forEach(rule => {
                const li = document.createElement('li');
                li.innerHTML = rule;
                rulesList.appendChild(li);
            });
        }
    }

    function showButtonsForQuestion(type) {
        if (!btnRed || !btnBlack || !btnHigher || !btnLower || !btnEqual || !btnInside || !btnOutside || !btnHerz || !btnPik || !btnKreuz || !btnKaro) return;
        btnRed.style.display = 'none';
        btnBlack.style.display = 'none';
        btnHigher.style.display = 'none';
        btnLower.style.display = 'none';
        btnEqual.style.display = 'none';
        btnInside.style.display = 'none';
        btnOutside.style.display = 'none';
        btnHerz.style.display = 'none';
        btnPik.style.display = 'none';
        btnKreuz.style.display = 'none';
        btnKaro.style.display = 'none';
        if (type === 'color') {
            btnRed.style.display = '';
            btnBlack.style.display = '';
            btnRed.disabled = false;
            btnBlack.disabled = false;
        } else if (type === 'highlow') {
            btnHigher.style.display = '';
            btnLower.style.display = '';
            btnEqual.style.display = '';
            btnHigher.disabled = false;
            btnLower.disabled = false;
            btnEqual.disabled = false;
        } else if (type === 'insideoutside') {
            btnInside.style.display = '';
            btnOutside.style.display = '';
            btnEqual.style.display = '';
            btnInside.disabled = false;
            btnOutside.disabled = false;
            btnEqual.disabled = false;
        } else if (type === 'symbol') {
            btnHerz.style.display = '';
            btnPik.style.display = '';
            btnKreuz.style.display = '';
            btnKaro.style.display = '';
            btnHerz.disabled = false;
            btnPik.disabled = false;
            btnKreuz.disabled = false;
            btnKaro.disabled = false;
        }
    }

    function startCurrentQuestion() {
        // Ziehe eine zufällige Karte
        currentCard = drawRandomCard();
        const q = questions[currentRound] || questions[0];
        questionText.textContent = q.text;
        cardReveal.textContent = '';
        questionFeedback.textContent = '';
        showButtonsForQuestion(q.type);
        // Karte zurücksetzen: Rückseite zeigen
        if(cardFlip) cardFlip.classList.remove('flipped');
        if(cardFront) cardFront.innerHTML = '';
        renderCurrentPlayerInfo();
        renderPlayerHand();
        renderPlayers();
    }

    function drawRandomCard() {
        const suits = ['♥', '♦', '♠', '♣'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'B', 'D', 'K'];
        const suit = suits[Math.floor(Math.random() * suits.length)];
        const value = values[Math.floor(Math.random() * values.length)];
        return { value, suit };
    }

    function revealCardAndFeedback(answer) {
        // Alle Buttons deaktivieren
        btnRed.disabled = true;
        btnBlack.disabled = true;
        btnHigher.disabled = true;
        btnLower.disabled = true;
        btnEqual.disabled = true;
        btnInside.disabled = true;
        btnOutside.disabled = true;
        btnHerz.disabled = true;
        btnPik.disabled = true;
        btnKreuz.disabled = true;
        btnKaro.disabled = true;
        // Flip-Animation starten
        if(cardFlip) cardFlip.classList.add('flipped');
        // Nach der Animation (700ms): Karte anzeigen
        setTimeout(() => {
            const isRed = currentCard.suit === '♥' || currentCard.suit === '♦';
            if(cardFront) {
                cardFront.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;">
                    <span style='font-size:2.2rem;${isRed ? 'color:#ff00de;' : 'color:#00eaff;'};text-shadow:0 0 8px #fff,0 0 16px #00eaff;'>${currentCard.value} ${currentCard.suit}</span>
                </div>`;
            }
            // Feedback anzeigen
            let correct = false;
            const q = questions[currentRound];
            if (q.type === 'color') {
                if (answer === 'Rot' && isRed) correct = true;
                if (answer === 'Schwarz' && !isRed) correct = true;
            } else if (q.type === 'highlow') {
                // Vergleiche mit der ersten Handkarte des Spielers
                const player = players[currentPlayerIdx];
                if (player && player.hand.length > 0) {
                    const prevCard = player.hand[0];
                    const cardOrder = ['A','2','3','4','5','6','7','8','9','10','B','D','K'];
                    const prevIdx = cardOrder.indexOf(prevCard.value);
                    const currIdx = cardOrder.indexOf(currentCard.value);
                    if (answer === 'Höher' && currIdx > prevIdx) correct = true;
                    if (answer === 'Tiefer' && currIdx < prevIdx) correct = true;
                    if (answer === 'Gleich' && currIdx === prevIdx) correct = true;
                }
            } else if (q.type === 'insideoutside') {
                // Vergleiche mit den ersten beiden Handkarten des Spielers
                const player = players[currentPlayerIdx];
                if (player && player.hand.length > 1) {
                    const cardOrder = ['A','2','3','4','5','6','7','8','9','10','B','D','K'];
                    const v1 = cardOrder.indexOf(player.hand[0].value);
                    const v2 = cardOrder.indexOf(player.hand[1].value);
                    const curr = cardOrder.indexOf(currentCard.value);
                    const min = Math.min(v1, v2);
                    const max = Math.max(v1, v2);
                    if (answer === 'Innerhalb' && curr > min && curr < max) correct = true;
                    if (answer === 'Außerhalb' && (curr < min || curr > max)) correct = true;
                    if (answer === 'Gleich' && currentCard.value === player.hand[1].value) correct = true;
                }
            } else if (q.type === 'symbol') {
                if (answer === 'Herz' && currentCard.suit === '♥') correct = true;
                if (answer === 'Pik' && currentCard.suit === '♠') correct = true;
                if (answer === 'Kreuz' && currentCard.suit === '♣') correct = true;
                if (answer === 'Karo' && currentCard.suit === '♦') correct = true;
            }
            questionFeedback.innerHTML = correct
                ? '<span style="color:#39ff14;">✔️ Richtig!</span>'
                : '<span style="color:#ff4e50;">❌ Falsch! Trinken!</span>';
            // Karte zur Hand des aktuellen Spielers hinzufügen
            if (players[currentPlayerIdx]) {
                players[currentPlayerIdx].hand.push({ ...currentCard });
            }
            renderPlayerHand();
            renderPlayers();
            // Nächster Spieler oder nächste Runde
            setTimeout(() => {
                currentPlayerIdx++;
                if (currentPlayerIdx >= players.length) {
                    currentPlayerIdx = 0;
                    currentRound++;
                    if (currentRound >= questions.length) {
                        // Spielende oder weitere Logik
                        questionTitle.innerHTML = 'Alle Fragerunden beendet!';
                        btnRed.style.display = 'none';
                        btnBlack.style.display = 'none';
                        btnHigher.style.display = 'none';
                        btnLower.style.display = 'none';
                        btnEqual.style.display = 'none';
                        btnInside.style.display = 'none';
                        btnOutside.style.display = 'none';
                        btnHerz.style.display = 'none';
                        btnPik.style.display = 'none';
                        btnKreuz.style.display = 'none';
                        btnKaro.style.display = 'none';
                        if (startPyramidBtn) startPyramidBtn.style.display = '';
                        return;
                    }
                }
                startCurrentQuestion();
            }, 1200);
        }, 700);
    }

    if (btnRed) {
        btnRed.addEventListener('click', () => {
            revealCardAndFeedback('Rot');
        });
    }
    if (btnBlack) {
        btnBlack.addEventListener('click', () => {
            revealCardAndFeedback('Schwarz');
        });
    }
    if (btnHigher) {
        btnHigher.addEventListener('click', () => {
            revealCardAndFeedback('Höher');
        });
    }
    if (btnLower) {
        btnLower.addEventListener('click', () => {
            revealCardAndFeedback('Tiefer');
        });
    }
    if (btnEqual) {
        btnEqual.addEventListener('click', () => {
            revealCardAndFeedback('Gleich');
        });
    }
    if (btnInside) {
        btnInside.addEventListener('click', () => {
            revealCardAndFeedback('Innerhalb');
        });
    }
    if (btnOutside) {
        btnOutside.addEventListener('click', () => {
            revealCardAndFeedback('Außerhalb');
        });
    }
    if (btnHerz) {
        btnHerz.addEventListener('click', () => {
            revealCardAndFeedback('Herz');
        });
    }
    if (btnPik) {
        btnPik.addEventListener('click', () => {
            revealCardAndFeedback('Pik');
        });
    }
    if (btnKreuz) {
        btnKreuz.addEventListener('click', () => {
            revealCardAndFeedback('Kreuz');
        });
    }
    if (btnKaro) {
        btnKaro.addEventListener('click', () => {
            revealCardAndFeedback('Karo');
        });
    }

    if (startPyramidBtn) {
        startPyramidBtn.addEventListener('click', () => {
            // Fragerunden-Ansicht ausblenden, Pyramidenrunde starten
            if (questionScreen) questionScreen.style.display = 'none';
            startPyramidRound();
        });
    }
    function startPyramidRound() {
        // Fragerunden-Screen ausblenden, Pyramiden-Screen einblenden
        if (questionScreen) questionScreen.style.display = 'none';
        if (pyramidScreen) pyramidScreen.style.display = 'block';
        renderPyramid();
        renderPlayers(); // Spielerliste bleibt synchron
        renderPyramidRules();
    }
    function renderPyramidRules() {
        const rules = [
            'In jeder Reihe der Pyramide werden Karten aufgedeckt – von unten nach oben.',
            '<b>Wer die Karte in seiner Hand hat, darf verteilen:</b>',
            '<span style="color:#00eaff">Reihe 1 (unten, 5 Karten):</span> 1 Schluck',
            '<span style="color:#00eaff">Reihe 2:</span> 2 Schlucke',
            '<span style="color:#00eaff">Reihe 3:</span> 3 Schlucke',
            '<span style="color:#00eaff">Reihe 4:</span> 4 Schlucke',
            '<span style="color:#00eaff">Reihe 5 (oben, 1 Karte):</span> 5 Schlucke',
            'Die Schlucke können beliebig an andere verteilt werden.',
            'Wer keine passende Karte hat, lehnt sich entspannt zurück – oder trinkt freiwillig mit! 🍻',
            '<b>Trinkt verantwortungsvoll und habt Spaß!</b>'
        ];
        const rulesList = document.getElementById('pyramidRules');
        if (rulesList) {
            rulesList.innerHTML = '';
            rules.forEach(rule => {
                const li = document.createElement('li');
                li.innerHTML = rule;
                rulesList.appendChild(li);
            });
        }
    }
    function renderPyramid() {
        if (!pyramidContainer) return;
        pyramidContainer.innerHTML = '';
        pyramidState = [];
        const rows = [5, 4, 3, 2, 1];
        let cardCount = 0;
        for (let r = 0; r < rows.length; r++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'pyramid-row';
            for (let c = 0; c < rows[r]; c++) {
                // Flip-Card-Struktur
                const cardDiv = document.createElement('div');
                cardDiv.className = 'pyramid-card card-flip';
                // Zufällige Karte zuweisen
                const cardData = drawRandomCard();
                cardDiv.dataset.value = cardData.value;
                cardDiv.dataset.suit = cardData.suit;
                cardDiv.dataset.index = pyramidState.length;
                // State für diese Karte
                pyramidState.push({
                    baseCard: { ...cardData },
                    currentTopCard: { ...cardData },
                    isActive: false,
                    cardDiv
                });
                // Flip-Card-Inhalt
                cardDiv.innerHTML = `
                  <div class="card-inner">
                    <div class="card-front"></div>
                    <div class="card-back">
                      <svg width='44' height='66' viewBox='0 0 80 120' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <rect x='2' y='2' width='76' height='116' rx='12' fill='#181a2a' stroke='#00eaff' stroke-width='3'/>
                        <rect x='10' y='10' width='60' height='100' rx='8' fill='#22223a' stroke='#ff00de' stroke-width='2'/>
                        <circle cx='40' cy='60' r='18' fill='none' stroke='#00eaff' stroke-width='2.5'/>
                        <text x='40' y='60' text-anchor='middle' alignment-baseline='middle' font-size='22' font-family='Inter, Arial, sans-serif' fill='#ff00de' font-weight='bold' style='letter-spacing:2px;'>★</text>
                      </svg>
                    </div>
                  </div>
                `;
                // Flip-Logik
                cardDiv.addEventListener('click', function() {
                  if (cardDiv.classList.contains('flipped')) return;
                  // Deaktiviere alle anderen Karten
                  pyramidState.forEach((p, idx) => { p.isActive = false; });
                  cardDiv.classList.add('flipped');
                  pyramidState[parseInt(cardDiv.dataset.index)].isActive = true;
                  activePyramidCard = pyramidState[parseInt(cardDiv.dataset.index)];
                  // Nach Flip: Wert+Symbol anzeigen
                  setTimeout(() => {
                    updatePyramidCardDisplay(cardDiv, activePyramidCard.currentTopCard);
                    renderPlayers(); // Spielerliste nach Flip aktualisieren
                    enableHandCardDrop();
                  }, 700);
                });
                rowDiv.appendChild(cardDiv);
                cardCount++;
            }
            pyramidContainer.appendChild(rowDiv);
        }
        renderPlayers(); // Spielerliste nach Rendern der Pyramide aktualisieren
        setTimeout(checkEndOfPyramidPhase, 200);
    }
    function updatePyramidCardDisplay(cardDiv, card) {
        const front = cardDiv.querySelector('.card-front');
        const isRed = card.suit === '♥' || card.suit === '♦';
        if (front) {
            front.innerHTML = `<span style='font-size:1.3rem;${isRed ? 'color:#ff00de;' : 'color:#00eaff;'};text-shadow:0 0 8px #fff,0 0 16px #00eaff;'>${card.value} ${card.suit}</span>`;
        }
    }
    function checkEndOfPyramidPhase() {
        // Prüfe, ob alle Pyramidenkarten geflippt und keine Handkarte mehr abgelegt werden kann
        const allFlipped = pyramidState.every(p => p.cardDiv.classList.contains('flipped'));
        let canDrop = false;
        if (activePyramidCard) {
            const topValue = activePyramidCard.currentTopCard.value;
            canDrop = players.some(player => player.hand.some(card => card.value === topValue));
        }
        if (allFlipped && !canDrop && startBusfahrenBtn) {
            startBusfahrenBtn.style.display = '';
        }
    }
    // Patch enableHandCardDrop, renderPyramid, und nach jedem Ablegen:
    function enableHandCardDrop() {
        if (!activePyramidCard) return;
        const topValue = activePyramidCard.currentTopCard.value;
        let anyEnabled = false;
        [playersListPyramid].forEach(playersList => {
            if (!playersList) return;
            Array.from(playersList.children).forEach((li, playerIdx) => {
                const cardsSpan = li.querySelector('.player-cards');
                if (!cardsSpan) return;
                Array.from(cardsSpan.children).forEach((cardDiv, handIdx) => {
                    const value = cardDiv.querySelector('span')?.textContent;
                    if (value === topValue) {
                        cardDiv.style.cursor = 'pointer';
                        cardDiv.style.opacity = '1';
                        cardDiv.addEventListener('click', function onDrop() {
                            players[playerIdx].hand.splice(handIdx, 1);
                            activePyramidCard.currentTopCard = { value, suit: cardDiv.querySelector('.card-symbol')?.textContent || '' };
                            updatePyramidCardDisplay(activePyramidCard.cardDiv, activePyramidCard.currentTopCard);
                            renderPlayers();
                            setTimeout(enableHandCardDrop, 100);
                            cardDiv.removeEventListener('click', onDrop);
                            setTimeout(checkEndOfPyramidPhase, 120);
                        });
                        anyEnabled = true;
                    } else {
                        cardDiv.style.cursor = 'not-allowed';
                        cardDiv.style.opacity = '0.5';
                    }
                });
            });
        });
        if (!anyEnabled) setTimeout(checkEndOfPyramidPhase, 120);
    }
    // Nach renderPyramid:
    function renderPyramid() {
        if (!pyramidContainer) return;
        pyramidContainer.innerHTML = '';
        pyramidState = [];
        const rows = [5, 4, 3, 2, 1];
        let cardCount = 0;
        for (let r = 0; r < rows.length; r++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'pyramid-row';
            for (let c = 0; c < rows[r]; c++) {
                // Flip-Card-Struktur
                const cardDiv = document.createElement('div');
                cardDiv.className = 'pyramid-card card-flip';
                // Zufällige Karte zuweisen
                const cardData = drawRandomCard();
                cardDiv.dataset.value = cardData.value;
                cardDiv.dataset.suit = cardData.suit;
                cardDiv.dataset.index = pyramidState.length;
                // State für diese Karte
                pyramidState.push({
                    baseCard: { ...cardData },
                    currentTopCard: { ...cardData },
                    isActive: false,
                    cardDiv
                });
                // Flip-Card-Inhalt
                cardDiv.innerHTML = `
                  <div class="card-inner">
                    <div class="card-front"></div>
                    <div class="card-back">
                      <svg width='44' height='66' viewBox='0 0 80 120' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <rect x='2' y='2' width='76' height='116' rx='12' fill='#181a2a' stroke='#00eaff' stroke-width='3'/>
                        <rect x='10' y='10' width='60' height='100' rx='8' fill='#22223a' stroke='#ff00de' stroke-width='2'/>
                        <circle cx='40' cy='60' r='18' fill='none' stroke='#00eaff' stroke-width='2.5'/>
                        <text x='40' y='60' text-anchor='middle' alignment-baseline='middle' font-size='22' font-family='Inter, Arial, sans-serif' fill='#ff00de' font-weight='bold' style='letter-spacing:2px;'>★</text>
                      </svg>
                    </div>
                  </div>
                `;
                // Flip-Logik
                cardDiv.addEventListener('click', function() {
                  if (cardDiv.classList.contains('flipped')) return;
                  // Deaktiviere alle anderen Karten
                  pyramidState.forEach((p, idx) => { p.isActive = false; });
                  cardDiv.classList.add('flipped');
                  pyramidState[parseInt(cardDiv.dataset.index)].isActive = true;
                  activePyramidCard = pyramidState[parseInt(cardDiv.dataset.index)];
                  // Nach Flip: Wert+Symbol anzeigen
                  setTimeout(() => {
                    updatePyramidCardDisplay(cardDiv, activePyramidCard.currentTopCard);
                    renderPlayers(); // Spielerliste nach Flip aktualisieren
                    enableHandCardDrop();
                  }, 700);
                });
                rowDiv.appendChild(cardDiv);
                cardCount++;
            }
            pyramidContainer.appendChild(rowDiv);
        }
        renderPlayers();
        setTimeout(checkEndOfPyramidPhase, 200);
    }
    function renderBusfahrenScreen() {
        // Platzhalter: Zeige Busfahrer und Handkarten
        if (!busfahrenContent) return;
        if (playersListBusfahren) playersListBusfahren.style.display = 'none';
        busfahrenContent.innerHTML = `<div style='font-size:1.3rem;margin-bottom:18px;'>${players[busfahrerIdx].name} ist Busfahrer!<br>Handkarten: ${players[busfahrerIdx].hand.map(card => card.value + ' ' + card.suit).join(', ')}</div>`;
        // Spielerliste synchronisieren
        if (playersListBusfahren) {
            playersListBusfahren.innerHTML = '';
            players.forEach((player, idx) => {
                const li = document.createElement('li');
                li.textContent = player.name;
                li.style.fontWeight = 'bold';
                li.style.color = '#00eaff';
                li.style.textShadow = '0 0 8px #ff00de, 0 0 16px #00eaff';
                li.style.marginBottom = '4px';
                const cardsSpan = document.createElement('span');
                cardsSpan.className = 'player-cards';
                player.hand.forEach(card => {
                    const cardDiv = document.createElement('div');
                    cardDiv.className = 'player-hand-card ' + ((card.suit === '♥' || card.suit === '♦') ? 'red' : 'black');
                    cardDiv.style.width = '22px';
                    cardDiv.style.height = '33px';
                    cardDiv.style.fontSize = '0.7rem';
                    cardDiv.innerHTML = `<span>${card.value}</span><span class="card-symbol">${card.suit}</span>`;
                    cardsSpan.appendChild(cardDiv);
                });
                li.appendChild(cardsSpan);
                playersListBusfahren.appendChild(li);
            });
        }
    }

    // Zurück zum Hauptmenü (alle Buttons)
    const backToStartBtns = document.querySelectorAll('.back-to-start-btn');
    backToStartBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (questionScreen) questionScreen.style.display = 'none';
            if (gameScreen) gameScreen.style.display = 'none';
            if (modeSelectContainer) modeSelectContainer.style.display = 'flex';
        });
    });

    // --- Busfahren-Phase: Spezial-Fragerunde für Busfahrer ---
    let busfahrerQuestionIdx = 0;
    let busfahrerCorrectStreak = 0;
    let busfahrerActive = false;
    let busfahrerHandSnapshot = [];

    // --- Busfahren-Phase: Einleitungsbildschirm ---
    let busfahrenIntroActive = false;
    function showBusfahrenIntro() {
        busfahrenIntroActive = true;
        if (!busfahrenContent) return;
        // Layout: Regelbox links, zentrale Box mittig, keine Spielerliste
        busfahrenContent.innerHTML = `
            <div class='busfahren-intro-center' style='display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:340px;width:100%;'>
                <h1 class='arcade-glow-title' style='font-size:2.3rem;letter-spacing:0.13em;text-transform:uppercase;font-weight:900;margin-bottom:0.2em;color:#fff;text-shadow:0 0 12px #00eaff,0 0 24px #ff00de,0 0 8px #fff;'>BUSFAHREN</h1>
                <div id='busfahrenSubline' style='font-size:1.18rem;color:#00eaff;text-align:center;margin-bottom:28px;'>Der Busfahrer muss jetzt die letzte Challenge meistern!</div>
                <button id='busfahrenReadyBtn' class='arcade-btn' style='font-size:1.5rem;padding:18px 48px;letter-spacing:0.08em;margin-top:18px;'>Bereit</button>
            </div>
        `;
        // Regelbox bleibt sichtbar, Spielerliste wird versteckt
        if (playersListBusfahren) playersListBusfahren.style.display = 'none';
        // Button-Event
        const readyBtn = document.getElementById('busfahrenReadyBtn');
        if (readyBtn) {
            readyBtn.onclick = () => {
                busfahrenIntroActive = false;
                startBusfahrerFragerunde();
            };
        }
        // Verstecke Spielerliste auch im HTML (falls sie noch sichtbar ist)
        const spielerBox = document.querySelector('#busfahrenScreen .arcade-box#playersListBox');
        if (spielerBox) spielerBox.style.display = 'none';
    }
    // Passe Busfahren-Event an: Zeige erst Intro, dann Fragerunde
    if (startBusfahrenBtn) {
        startBusfahrenBtn.addEventListener('click', () => {
            // Busfahrer bestimmen (meiste Handkarten, bei Gleichstand höchste Karte)
            let maxCards = Math.max(...players.map(p => p.hand.length));
            let kandidaten = players.map((p, idx) => ({...p, idx})).filter(p => p.hand.length === maxCards);
            if (kandidaten.length > 1) {
                const cardOrder = ['A','2','3','4','5','6','7','8','9','10','B','D','K'];
                let bestIdx = 0;
                let bestValue = -1;
                kandidaten.forEach((p, i) => {
                    let highest = Math.max(...p.hand.map(card => cardOrder.indexOf(card.value)));
                    if (highest > bestValue) {
                        bestValue = highest;
                        bestIdx = i;
                    }
                });
                busfahrerIdx = kandidaten[bestIdx].idx;
            } else if (kandidaten.length === 1) {
                busfahrerIdx = kandidaten[0].idx;
            } else {
                busfahrerIdx = 0;
            }
            if (pyramidScreen) pyramidScreen.style.display = 'none';
            if (busfahrenScreen) busfahrenScreen.style.display = 'block';
            // Spielerliste ausblenden
            if (playersListBusfahren) playersListBusfahren.style.display = 'none';
            showBusfahrenIntro();
            renderBusfahrenRules();
        });
    }

    function startBusfahrerFragerunde() {
        busfahrerQuestionIdx = 0;
        busfahrerCorrectStreak = 0;
        busfahrerActive = true;
        busfahrerHandSnapshot = [];
        renderBusfahrerFrage();
    }

    function renderBusfahrerFrage() {
        if (!busfahrenContent) return;
        if (playersListBusfahren) playersListBusfahren.style.display = 'none';
        const spielerBox = document.querySelector('#busfahrenScreen .arcade-box#playersListBox');
        if (spielerBox) spielerBox.style.display = 'none';
        // Frage anzeigen
        const q = questions[busfahrerQuestionIdx];
        busfahrenContent.innerHTML = `
            <div style='position:relative;min-height:64px;'>
                <div style='font-size:1.3rem;margin-bottom:18px;margin-top:48px;'>${players[busfahrerIdx].name} ist Busfahrer!</div>
                <div class='arcade-box' style='max-width:420px;margin:auto;text-align:center;'>
                    <h2 class='arcade-section-title'>Busfahrer-Frage ${busfahrerQuestionIdx+1}/4</h2>
                    <div id='busfahrerQuestionText' style='font-size:1.3rem;font-weight:700;margin-bottom:16px;'>${q.text}</div>
                    <div id='busfahrerCardDeckContainer' style='display:flex;justify-content:center;margin-bottom:24px;'>
                        <div class='card-flip' id='busfahrerCardFlip'>
                            <div class='card-inner'>
                                <div class='card-front'></div>
                                <div class='card-back'>
                                    <svg width='80' height='120' viewBox='0 0 80 120' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                        <rect x='2' y='2' width='76' height='116' rx='12' fill='#181a2a' stroke='#00eaff' stroke-width='3'/>
                                        <rect x='10' y='10' width='60' height='100' rx='8' fill='#22223a' stroke='#ff00de' stroke-width='2'/>
                                        <circle cx='40' cy='60' r='18' fill='none' stroke='#00eaff' stroke-width='2.5'/>
                                        <text x='40' y='60' text-anchor='middle' dominant-baseline='middle' font-size='22' font-family='Inter, Arial, sans-serif' fill='#ff00de' font-weight='bold' style='letter-spacing:2px;'>★</text>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class='answer-btn-row' id='busfahrerAnswerBtns'></div>
                    <div id='busfahrerCardReveal' style='margin:24px 0;font-size:2.2rem;min-height:48px;'></div>
                    <div id='busfahrerFeedback' style='font-size:1.2rem;font-weight:700;min-height:32px;'></div>
                    <div id='busfahrerHand' style='display:flex;justify-content:center;gap:8px;margin-top:24px;'></div>
                </div>
            </div>
        `;
        renderBusfahrerHand();
        // Buttons je nach Fragetyp
        const btnRow = document.getElementById('busfahrerAnswerBtns');
        if (!btnRow) return;
        btnRow.innerHTML = '';
        if (q.type === 'color') {
            btnRow.appendChild(createBusfahrerBtn('Rot'));
            btnRow.appendChild(createBusfahrerBtn('Schwarz'));
        } else if (q.type === 'highlow') {
            btnRow.appendChild(createBusfahrerBtn('Höher'));
            btnRow.appendChild(createBusfahrerBtn('Tiefer'));
            btnRow.appendChild(createBusfahrerBtn('Gleich'));
        } else if (q.type === 'insideoutside') {
            btnRow.appendChild(createBusfahrerBtn('Innerhalb'));
            btnRow.appendChild(createBusfahrerBtn('Außerhalb'));
            btnRow.appendChild(createBusfahrerBtn('Gleich'));
        } else if (q.type === 'symbol') {
            btnRow.appendChild(createBusfahrerBtn('Herz'));
            btnRow.appendChild(createBusfahrerBtn('Pik'));
            btnRow.appendChild(createBusfahrerBtn('Kreuz'));
            btnRow.appendChild(createBusfahrerBtn('Karo'));
        }
        // Kein Back-to-Start-Button mehr hier, globaler Button bleibt oben rechts
    }
    function renderBusfahrerHand() {
        const handDiv = document.getElementById('busfahrerHand');
        if (!handDiv) return;
        handDiv.innerHTML = '';
        // Zeige die gezogenen Karten des Busfahrers (busfahrerHandSnapshot)
        busfahrerHandSnapshot.forEach(card => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'player-hand-card ' + ((card.suit === '♥' || card.suit === '♦') ? 'red' : 'black');
            cardDiv.innerHTML = `<span>${card.value}</span><span class="card-symbol">${card.suit}</span>`;
            handDiv.appendChild(cardDiv);
        });
    }
    function createBusfahrerBtn(label) {
        const btn = document.createElement('button');
        btn.className = 'arcade-btn';
        btn.textContent = label;
        btn.onclick = () => busfahrerAntwort(label);
        return btn;
    }
    let busfahrerCurrentCard = null;
    function busfahrerAntwort(answer) {
        // Karte ziehen
        busfahrerCurrentCard = drawRandomCard();
        // Flip-Animation
        const cardFlip = document.getElementById('busfahrerCardFlip');
        const cardFront = cardFlip ? cardFlip.querySelector('.card-front') : null;
        if(cardFlip) cardFlip.classList.add('flipped');
        setTimeout(() => {
            const isRed = busfahrerCurrentCard.suit === '♥' || busfahrerCurrentCard.suit === '♦';
            if(cardFront) {
                cardFront.innerHTML = `<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;'>
                    <span style='font-size:2.2rem;${isRed ? 'color:#ff00de;' : 'color:#00eaff;'};text-shadow:0 0 8px #fff,0 0 16px #00eaff;'>${busfahrerCurrentCard.value} ${busfahrerCurrentCard.suit}</span>
                </div>`;
            }
            // Feedback
            let correct = false;
            const q = questions[busfahrerQuestionIdx];
            const cardOrder = ['A','2','3','4','5','6','7','8','9','10','B','D','K'];
            if (q.type === 'color') {
                if (answer === 'Rot' && isRed) correct = true;
                if (answer === 'Schwarz' && !isRed) correct = true;
            } else if (q.type === 'highlow') {
                if (busfahrerHandSnapshot.length > 0) {
                    const prevCard = busfahrerHandSnapshot[0];
                    const prevIdx = cardOrder.indexOf(prevCard.value);
                    const currIdx = cardOrder.indexOf(busfahrerCurrentCard.value);
                    if (answer === 'Höher' && currIdx > prevIdx) correct = true;
                    if (answer === 'Tiefer' && currIdx < prevIdx) correct = true;
                    if (answer === 'Gleich' && currIdx === prevIdx) correct = true;
                }
            } else if (q.type === 'insideoutside') {
                if (busfahrerHandSnapshot.length > 1) {
                    const v1 = cardOrder.indexOf(busfahrerHandSnapshot[0].value);
                    const v2 = cardOrder.indexOf(busfahrerHandSnapshot[1].value);
                    const curr = cardOrder.indexOf(busfahrerCurrentCard.value);
                    const min = Math.min(v1, v2);
                    const max = Math.max(v1, v2);
                    if (answer === 'Innerhalb' && curr > min && curr < max) correct = true;
                    if (answer === 'Außerhalb' && (curr < min || curr > max)) correct = true;
                    if (answer === 'Gleich' && busfahrerCurrentCard.value === busfahrerHandSnapshot[1].value) correct = true;
                }
            } else if (q.type === 'symbol') {
                if (answer === 'Herz' && busfahrerCurrentCard.suit === '♥') correct = true;
                if (answer === 'Pik' && busfahrerCurrentCard.suit === '♠') correct = true;
                if (answer === 'Kreuz' && busfahrerCurrentCard.suit === '♣') correct = true;
                if (answer === 'Karo' && busfahrerCurrentCard.suit === '♦') correct = true;
            }
            const feedbackDiv = document.getElementById('busfahrerFeedback');
            const revealDiv = document.getElementById('busfahrerCardReveal');
            if (revealDiv) revealDiv.textContent = `${busfahrerCurrentCard.value} ${busfahrerCurrentCard.suit}`;
            if (feedbackDiv) feedbackDiv.innerHTML = correct
                ? '<span style="color:#39ff14;">✔️ Richtig!</span>'
                : '<span style="color:#ff4e50;">❌ Falsch! Trink einen Schluck und fang von vorne an!</span>';
            if (correct) {
                busfahrerCorrectStreak++;
                busfahrerQuestionIdx++;
                busfahrerHandSnapshot.push({...busfahrerCurrentCard});
                renderBusfahrerHand(); // Handkarten aktualisieren
                if (busfahrerCorrectStreak >= 4) {
                    // Erfolg!
                    setTimeout(showBusfahrerErfolg, 900);
                } else {
                    setTimeout(renderBusfahrerFrage, 900);
                }
            } else {
                // Reset
                busfahrerCorrectStreak = 0;
                busfahrerQuestionIdx = 0;
                busfahrerHandSnapshot = [];
                renderBusfahrerHand(); // Handkarten aktualisieren
                setTimeout(renderBusfahrerFrage, 1200);
            }
        }, 700);
    }
    function showBusfahrerErfolg() {
        if (!busfahrenContent) return;
        busfahrenContent.innerHTML = `
            <div style='font-size:1.5rem;margin-bottom:18px;color:#39ff14;text-shadow:0 0 8px #fff;'>🎉 Busfahren geschafft! 🎉</div>
            <button id='backToLobbyBtn' class='arcade-btn' style='font-size:1.3rem;padding:18px 48px;margin-top:24px;'>Zurück zur Lobby</button>
        `;
        const btn = document.getElementById('backToLobbyBtn');
        if (btn) {
            btn.onclick = () => {
                if (busfahrenScreen) busfahrenScreen.style.display = 'none';
                if (lobbyContainer) lobbyContainer.style.display = 'flex';
                // Reset für neues Spiel
                players.forEach(p => p.hand = []);
                renderPlayers();
            };
        }
    }
    function renderBusfahrenRules() {
        const rules = [
            '<b>Busfahren – Spezialregeln:</b>',
            'Der Busfahrer muss alle 4 Fragen (Rot/Schwarz, Höher/Tiefer, Innerhalb/Außerhalb, Symbol) nacheinander richtig beantworten.',
            'Bei jedem Fehler: 1 Schluck trinken und wieder von vorne beginnen!',
            'Erst wenn alle 4 Fragen in Folge richtig beantwortet wurden, ist das Spiel vorbei.'
        ];
        const rulesList = document.getElementById('busfahrenRules');
        if (rulesList) {
            rulesList.innerHTML = '';
            rules.forEach(rule => {
                const li = document.createElement('li');
                li.innerHTML = rule;
                rulesList.appendChild(li);
            });
        }
    }

    const globalBackToStart = document.getElementById('globalBackToStart');
    const startScreen = document.getElementById('startScreen');

    function showGlobalBackBtn(show) {
        if (globalBackToStart) globalBackToStart.style.display = show ? '' : 'none';
    }
    // Zeige Button in allen Phasen außer Startscreen
    function updateGlobalBackBtnVisibility() {
        if (startScreen && startScreen.style.display !== 'none' && startScreen.classList.contains('active')) {
            showGlobalBackBtn(false);
        } else if (modeSelectContainer && modeSelectContainer.style.display !== 'none') {
            showGlobalBackBtn(false);
        } else {
            showGlobalBackBtn(true);
        }
    }
    // Event für globalen Button
    if (globalBackToStart) {
        globalBackToStart.onclick = () => {
            // Alle Screens ausblenden, Startscreen/Mode-Selector zeigen
            [lobbyContainer, gameScreen, questionScreen, pyramidScreen, busfahrenScreen].forEach(s => { if (s) s.style.display = 'none'; });
            if (modeSelectContainer) modeSelectContainer.style.display = 'flex';
            if (startScreen) startScreen.classList.add('active');
            updateGlobalBackBtnVisibility();
        };
    }
    // Nach jedem Screenwechsel aufrufen:
    function showScreen(screen) {
        [lobbyContainer, gameScreen, questionScreen, pyramidScreen, busfahrenScreen, startScreen].forEach(s => { if (s) s.style.display = 'none'; if (s) s.classList.remove('active'); });
        if (screen) { screen.style.display = 'block'; screen.classList.add('active'); }
        updateGlobalBackBtnVisibility();
    }
    // Patch alle Stellen, wo Screens gewechselt werden:
    // Beispiel: showScreen(lobbyContainer) statt lobbyContainer.style.display = 'flex';

    // --- Avatar-Auswahlmenü in der Lobby ---
    const avatarSelectGallery = document.getElementById('avatarSelectGallery');
    const avatarFiles = [
        'affe-avatar.jpg',
        'vogel-avatar.jpg',
        'elefant-avatar.jpg',
        'hund-avatar.jpg',
        'katze-avatar.jpg',
        'giraffe-avatar.jpg',
        'krokodil-avatar.jpg',
        'hai-avatar.jpg'
    ];
    let selectedAvatar = avatarFiles[0];
    function renderAvatarSelectGallery() {
        if (!avatarSelectGallery) return;
        avatarSelectGallery.innerHTML = '';
        avatarFiles.forEach(file => {
            const img = document.createElement('img');
            img.src = `images/avatars/${file}`;
            img.alt = 'Avatar';
            img.className = 'avatar-select-thumb' + (selectedAvatar === file ? ' selected' : '');
            img.onclick = () => {
                selectedAvatar = file;
                renderAvatarSelectGallery();
            };
            avatarSelectGallery.appendChild(img);
        });
    }
    renderAvatarSelectGallery();
    // Spieler hinzufügen: Avatar übernehmen
    if (addPlayerBtn) {
        addPlayerBtn.addEventListener('click', () => {
            const name = playerNameInput.value.trim();
            if (name && !players.some(p => p.name === name)) {
                players.push({ name, hand: [], avatar: selectedAvatar });
                playerNameInput.value = '';
                renderPlayers();
            }
        });
    }
}); 