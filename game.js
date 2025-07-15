// CardDeck class for Busfahren (52 cards, shuffle, draw)
class CardDeck {
    constructor() {
        this.cards = [];
        const suits = ['♥', '♦', '♠', '♣'];
        const values = [
            'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'B', 'D', 'K'
        ];
        for (const suit of suits) {
            for (const value of values) {
                this.cards.push({ value, suit });
            }
        }
    }
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    drawCard() {
        return this.cards.pop();
    }
    drawCards(n) {
        const drawn = [];
        for (let i = 0; i < n; i++) {
            if (this.cards.length === 0) break;
            drawn.push(this.drawCard());
        }
        return drawn;
    }
    cardsLeft() {
        return this.cards.length;
    }
}
// Global verfügbar machen
window.CardDeck = CardDeck; 