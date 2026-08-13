# Knight's Grand Tour

I have designed and built the Closed Knight's Tour interactive visualizer and algorithmic solver, inspired by Jonathan McKinney's formula and 4 basic coding principles:

4 Basic Coding Principles Pipeline:

Storing: Manages the Knight_64Bitboard[8][8] spatial state and a live 64-bit binary bitmask register (0x0000000000000000 to 0xFFFFFFFFFFFFFFFF).

Sending: Dispatches the 8 directional move vectors (4 directions × 2 multiples = 8 moves) sorted by onward accessibility degrees (Warnsdorff / First Fit Best Fit).

Processing: Evaluates 2D array boundary constraints (0 ≤ row, col < 8), validates unvisited squares, and optimizes closed-loop re-entrancy lookahead.

Saving: Records the complete 64-step algebraic coordinate trajectory (1. E4 2. F6 ... 64. C3) and confirms that move 64 connects directly back to move 1 in a single legal knight leap.

Interactive 8x8 Chessboard:

Rendered with luxury obsidian & gold styling, standard rank/file algebraic coordinates (a1–h8), and animated Knight piece leaps.

Dynamic glowing SVG vector trail tracing the sequential hops with a special pulsing closure ribbon when all 64 squares complete a closed loop.

Interactive play mode allowing manual moves with onward accessibility degrees (°) displayed on legal target squares.

Analytical Instruments & Controls:

8-Direction Vector Compass: Real-time radar highlighting each active directional leap.

Playback Engine: Play, pause, step forward/backward, instant solve, and variable speed scrubber.

Preset Library: Features Euler's classic tour, Vandermonde's closed loop, Beverley's semi-magic tour, and McKinney's central & corner loops.

Synthesized Audio & Notation Export: Procedural Web Audio movement clicks, victory fanfares, and one-click JSON/Algebraic notation copy.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://chess-knight-show.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/eb861c2e-69a9-43df-96b0-198b749864df).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
