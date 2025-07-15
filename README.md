# Busfahren – Das Trinkspiel (Web App)

A modern, interactive single-player implementation of the drinking game "Busfahren" as a web app. Built with HTML, CSS, and JavaScript (no frameworks), featuring a state-driven architecture, responsive design, and future-ready for multiplayer.

## Features

- **State-driven UI**: All rendering is based on a single game state for robust, maintainable code.
- **Responsive, modern design**: Uses CSS Grid for the pyramid, realistic 3D card effects, and the Inter font throughout.
- **Two phases**:
  - **Question round**: Card-based questions (with "Gleich" option), visual feedback, and hand card rewards.
  - **Pyramid phase**: 5-row card pyramid, sequential uncovering, drag-and-drop hand cards (one per turn, only valid cards allowed), overlays and lock icons for unavailable cards.
- **Rules box**: Always visible on the left after username entry.
- **Visual feedback**: Feedback overlays only in the question phase, dismissible after 0.5s.
- **Face card logic**: Bube, Dame, König count as 10 for questions, but only placeable on the same face card in the pyramid.
- **Prepared for multiplayer**: Modular code with hooks for future WebSocket/online play.

## Usage

1. Open `index.html` in your browser.
2. Enter your name to start.
3. Answer the questions to collect hand cards.
4. Drag hand cards onto the pyramid (only valid moves allowed, one per turn).
5. Follow the rules and enjoy!

## Tech Stack
- HTML5, CSS3 (Grid, Flexbox, 3D effects)
- Modern JavaScript (ES6+), modular classes
- Inter font via Google Fonts

## Future Plans
- Multiplayer support via WebSockets
- More question types and custom rules
- Animations and sound effects

---

**Made with ❤️ for Busfahren fans!** 