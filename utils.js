// Utility functions for Busfahren

/**
 * Renders a card as HTML.
 * @param {Object} card - The card object {value, suit}
 * @param {Object} options - Options for rendering
 * @param {boolean} options.mini - If true, renders a mini card
 * @param {boolean} options.faceUp - If true, shows the card face up
 * @returns {string} - HTML string for the card
 */
function renderCard(card, {mini = false, faceUp = true} = {}) {
    const isRed = card.suit === '♥' || card.suit === '♦';
    const cardClass = mini ? 'hand-card mini' : 'hand-card';
    if (!faceUp) {
        return `<div class="${cardClass} card-back-only card-back-black"><div class="card-back"></div></div>`;
    }
    return `<div class="${cardClass}">
        <div class="card-value">${card.value}</div>
        <div class="card-suit${isRed ? ' red-suit' : ''}">${card.suit}</div>
    </div>`;
}

/**
 * Adds a card to the history area.
 */
function addCardToHistory(card) {
    const historyContainer = document.getElementById('cardHistory');
    historyContainer.innerHTML += renderCard(card, {mini: true, faceUp: true});
}

/**
 * Gets the center position of a DOM element.
 */
function getElementCenterPosition(el) {
    const rect = el.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

/**
 * Animates dealing a card.
 */
function animateDealCard(cardHTML, handContainer, onComplete) {
    const deck = document.getElementById('card-deck');
    const hand = handContainer;
    const deckPos = getElementCenterPosition(deck);
    const tempCard = document.createElement('div');
    tempCard.className = 'card dealing-card';
    tempCard.innerHTML = cardHTML;
    document.body.appendChild(tempCard);
    const handPos = getElementCenterPosition(hand);
    const fromX = deckPos.x - 30;
    const fromY = deckPos.y - 45;
    const toX = handPos.x - 30;
    const toY = handPos.y - 45;
    tempCard.style.setProperty('--from-x', `${fromX - toX}px`);
    tempCard.style.setProperty('--from-y', `${fromY - toY}px`);
    tempCard.style.setProperty('--mid-x', `${(fromX - toX) * 0.5}px`);
    tempCard.style.setProperty('--mid-y', `${(fromY - toY) * 0.5 - 40}px`);
    tempCard.style.setProperty('--to-x', `0px`);
    tempCard.style.setProperty('--to-y', `0px`);
    tempCard.style.left = `${toX}px`;
    tempCard.style.top = `${toY}px`;
    tempCard.addEventListener('animationend', () => {
        tempCard.remove();
        if (onComplete) onComplete();
    });
}

/**
 * Deals hand cards with animation.
 */
function dealHandCardsWithAnimation(cards, handContainer) {
    let i = 0;
    function dealNext() {
        if (i >= cards.length) return;
        const card = cards[i];
        animateDealCard(renderCard(card), handContainer, () => {
            // addCardToHand(card, handContainer); // This line was not in the original file, so it's removed.
            i++;
            setTimeout(dealNext, 120);
        });
    }
    handContainer.innerHTML = '';
    dealNext();
}

window.renderCard = renderCard;
window.addCardToHistory = addCardToHistory;
window.getElementCenterPosition = getElementCenterPosition;
window.animateDealCard = animateDealCard;
window.dealHandCardsWithAnimation = dealHandCardsWithAnimation; 