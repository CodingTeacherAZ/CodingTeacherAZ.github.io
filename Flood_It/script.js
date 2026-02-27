// app.js
(() => {
  /**
   * Flood It - single level for now
   * - Board starts at top-left
   * - Each move chooses a new color and floods connected region from top-left
   * - Goal: entire board becomes one color
   */

  const CONFIG = {
    rows: 14,
    cols: 14,
    colors: [
      "#ef4444", // red
      "#f59e0b", // amber
      "#22c55e", // green
      "#3b82f6", // blue
      "#a855f7", // purple
      "#14b8a6", // teal
    ],
    // Optional: scale cells based on board size / viewport (simple and safe)
    autoCellSize: true,
  };

  const els = {
    board: document.getElementById("board"),
    palette: document.getElementById("palette"),
    moves: document.getElementById("moves"),
    best: document.getElementById("best"),
    newGame: document.getElementById("newGame"),
    status: document.getElementById("status"),
  };

  /** Game state */
  let grid = []; // color indexes
  let moves = 0;
  let inPlay = true;
  let floodedSet = new Set(); // indices currently in flooded region
  const bestKey = `floodit_best_${CONFIG.rows}x${CONFIG.cols}_${CONFIG.colors.length}`;

  function idx(r, c) {
    return r * CONFIG.cols + c;
  }

  function inBounds(r, c) {
    return r >= 0 && r < CONFIG.rows && c >= 0 && c < CONFIG.cols;
  }

  function neighbors(r, c) {
    return [
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1],
    ].filter(([rr, cc]) => inBounds(rr, cc));
  }

  function loadBest() {
    const v = localStorage.getItem(bestKey);
    els.best.textContent = v ? String(v) : "—";
  }

  function maybeUpdateBest(finalMoves) {
    const current = localStorage.getItem(bestKey);
    const currentNum = current ? Number(current) : null;
    if (!currentNum || finalMoves < currentNum) {
      localStorage.setItem(bestKey, String(finalMoves));
      loadBest();
    }
  }

  function setStatus(text) {
    els.status.textContent = text || "";
  }

  function setMoves(n) {
    moves = n;
    els.moves.textContent = String(moves);
  }

  function randomGrid() {
    const out = new Array(CONFIG.rows * CONFIG.cols);
    for (let r = 0; r < CONFIG.rows; r++) {
      for (let c = 0; c < CONFIG.cols; c++) {
        out[idx(r, c)] = Math.floor(Math.random() * CONFIG.colors.length);
      }
    }
    return out;
  }

  function buildBoardDom() {
    els.board.innerHTML = "";
    els.board.style.gridTemplateColumns = `repeat(${CONFIG.cols}, var(--cell-size))`;
    els.board.style.gridTemplateRows = `repeat(${CONFIG.rows}, var(--cell-size))`;

    const frag = document.createDocumentFragment();
    for (let r = 0; r < CONFIG.rows; r++) {
      for (let c = 0; c < CONFIG.cols; c++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.setAttribute("role", "gridcell");
        cell.dataset.r = String(r);
        cell.dataset.c = String(c);
        frag.appendChild(cell);
      }
    }
    els.board.appendChild(frag);
  }

  function renderGrid() {
    const children = els.board.children;
    for (let i = 0; i < children.length; i++) {
      children[i].style.background = CONFIG.colors[grid[i]];
    }
  }

  function buildPalette() {
    els.palette.innerHTML = "";
    const currentColor = grid[idx(0, 0)];

    CONFIG.colors.forEach((hex, colorIndex) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "swatch";
      btn.style.background = hex;
      btn.title = `Choose color ${colorIndex + 1}`;
      btn.setAttribute("aria-label", `Choose color ${colorIndex + 1}`);
      btn.dataset.color = String(colorIndex);

      // Disallow picking the current flooded color
      const disabled = !inPlay || colorIndex === currentColor;
      btn.setAttribute("aria-disabled", disabled ? "true" : "false");
      btn.disabled = disabled;

      btn.addEventListener("click", () => {
        const chosen = Number(btn.dataset.color);
        playMove(chosen);
      });

      els.palette.appendChild(btn);
    });
  }

  /**
   * Compute flooded region from (0,0) using current color
   * Returns a Set of linear indices.
   */
  function computeFloodedSet() {
    const startColor = grid[idx(0, 0)];
    const visited = new Set();
    const queue = [[0, 0]];
    visited.add(idx(0, 0));

    while (queue.length) {
      const [r, c] = queue.shift();
      for (const [nr, nc] of neighbors(r, c)) {
        const nIndex = idx(nr, nc);
        if (visited.has(nIndex)) continue;
        if (grid[nIndex] !== startColor) continue;
        visited.add(nIndex);
        queue.push([nr, nc]);
      }
    }
    return visited;
  }

  /**
   * After recoloring flooded region, expand region by absorbing adjacent cells
   * that match the new flooded color (repeat until stable).
   */
  function expandFloodedSetFromCurrentColor() {
    const targetColor = grid[idx(0, 0)];
    const queue = [];

    // seed queue with all flooded cells
    for (const i of floodedSet) {
      const r = Math.floor(i / CONFIG.cols);
      const c = i % CONFIG.cols;
      queue.push([r, c]);
    }

    while (queue.length) {
      const [r, c] = queue.shift();
      for (const [nr, nc] of neighbors(r, c)) {
        const nIndex = idx(nr, nc);
        if (floodedSet.has(nIndex)) continue;
        if (grid[nIndex] !== targetColor) continue;
        floodedSet.add(nIndex);
        queue.push([nr, nc]);
      }
    }
  }

  function isWin() {
    const first = grid[0];
    for (let i = 1; i < grid.length; i++) {
      if (grid[i] !== first) return false;
    }
    return true;
  }

  function playMove(chosenColor) {
    if (!inPlay) return;

    const currentColor = grid[idx(0, 0)];
    if (chosenColor === currentColor) return;

    // Recolor all cells in flooded region to chosenColor
    for (const i of floodedSet) {
      grid[i] = chosenColor;
    }

    // Flood color changed, so expand region to include adjacent chosenColor cells
    expandFloodedSetFromCurrentColor();

    setMoves(moves + 1);
    renderGrid();
    buildPalette();

    if (isWin()) {
      inPlay = false;
      setStatus(`Solved in ${moves} moves.`);
      maybeUpdateBest(moves);
      buildPalette();
    } else {
      setStatus("");
    }
  }

  function maybeAutoCellSize() {
    if (!CONFIG.autoCellSize) return;

    // Simple responsive sizing: choose a cell size that fits comfortably
    // within the board container (approx), clamped to a reasonable range.
    const padding = 64; // container padding/margins estimate
    const maxWidth = Math.min(window.innerWidth, 980) - padding;
    const maxHeight = window.innerHeight - 320; // leave room for headers/controls

    const sizeByWidth = Math.floor((maxWidth - (CONFIG.cols - 1) * 3) / CONFIG.cols);
    const sizeByHeight = Math.floor((maxHeight - (CONFIG.rows - 1) * 3) / CONFIG.rows);

    const cell = Math.max(16, Math.min(36, Math.min(sizeByWidth, sizeByHeight)));
    document.documentElement.style.setProperty("--cell-size", `${cell}px`);
  }

  function newGame() {
    inPlay = true;
    setMoves(0);
    setStatus("");

    grid = randomGrid();
    floodedSet = computeFloodedSet();

    buildBoardDom();
    renderGrid();
    buildPalette();
  }

  // Init
  loadBest();
  maybeAutoCellSize();
  newGame();

  els.newGame.addEventListener("click", () => {
    maybeAutoCellSize();
    newGame();
  });

  window.addEventListener("resize", () => {
    maybeAutoCellSize();
  });

  // Keyboard support: number keys 1..N select palette
  window.addEventListener("keydown", (e) => {
    if (!inPlay) return;
    const n = Number(e.key);
    if (!Number.isFinite(n)) return;
    const colorIndex = n - 1;
    if (colorIndex >= 0 && colorIndex < CONFIG.colors.length) {
      playMove(colorIndex);
    }
  });
})();
