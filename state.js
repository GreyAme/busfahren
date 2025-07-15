// State management for Busfahren
// --- Player state ---
window.players = [];
window.currentPlayerIndex = 0;
window.localMultiplayerHands = [];
window.flippedHandCardsPerPlayer = [];

// --- Game state ---
window.deck = [];
window.localMultiplayerActive = false;
window.localMultiplayerQuestionIndex = undefined;
window.localMultiplayerQuestionCard = undefined;
window.localMultiplayerQuestionCards = undefined;
// Add further state variables as needed for the game flow. 