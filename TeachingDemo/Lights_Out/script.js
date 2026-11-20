
(() => {
  const SIZE = 4;
  const CELLS = SIZE * SIZE;
  const ALL_COMBOS = 1 << CELLS; // 65,536

  // ----- Board model -----
  // The board is a 4x4 array of booleans (true = ON).
  const makeEmptyBoard = () => Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  const cloneBoard = b => b.map(row => row.slice());
  const isAllOff = b => b.every(row => row.every(v => !v));
  const boardToMask = b => {
    let m = 0;
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++)
        if (b[r][c]) m |= 1 << (r * SIZE + c);
    return m;
  };

  // Toggle the pressed light and its orthogonal neighbours, with boundary checks.
  const NEIGHBOURS = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]];
  function press(board, r, c) {
    for (const [dr, dc] of NEIGHBOURS) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
        board[nr][nc] = !board[nr][nc];
      }
    }
  }

  // ----- Solver: exhaustive search over all 65,536 press combinations -----
  // PRESS_MASK[i] = bitmask of lights toggled by pressing cell i.
  const PRESS_MASK = Array.from({ length: CELLS }, (_, i) => {
    const b = makeEmptyBoard();
    press(b, Math.floor(i / SIZE), i % SIZE);
    return boardToMask(b);
  });

  // EFFECT[combo] = combined toggle mask of pressing every cell in `combo` once.
  // Built incrementally: EFFECT[combo] = EFFECT[combo without lowest bit] ^ PRESS_MASK[lowest bit].
  const EFFECT = new Uint16Array(ALL_COMBOS);
  const POPCOUNT = new Uint8Array(ALL_COMBOS);
  for (let combo = 1; combo < ALL_COMBOS; combo++) {
    const low = combo & -combo;
    const idx = 31 - Math.clz32(low);
    EFFECT[combo] = EFFECT[combo ^ low] ^ PRESS_MASK[idx];
    POPCOUNT[combo] = POPCOUNT[combo ^ low] + 1;
  }

  // Pressing a combination solves the board when its effect equals the board's ON mask.
  // Returns the fewest presses, or -1 if unsolvable.
  function minimumMoves(board) {
    const target = boardToMask(board);
    let best = -1;
    for (let combo = 0; combo < ALL_COMBOS; combo++) {
      if (EFFECT[combo] === target && (best < 0 || POPCOUNT[combo] < best)) {
        best = POPCOUNT[combo];
      }
    }
    return best;
  }

  // ----- Puzzle generation -----
  // Start all OFF and apply random presses, so the result is always solvable.
  function generatePuzzle(previousMask) {
    while (true) {
      const board = makeEmptyBoard();
      const presses = 3 + Math.floor(Math.random() * 10); // 3–12 random presses
      for (let i = 0; i < presses; i++) {
        const cell = Math.floor(Math.random() * CELLS);
        press(board, Math.floor(cell / SIZE), cell % SIZE);
      }
      if (isAllOff(board)) continue;                       // reject all-OFF
      if (boardToMask(board) === previousMask) continue;   // must differ from previous puzzle
      const min = minimumMoves(board);
      if (min <= 0) continue;                              // safety: must be solvable with ≥1 move
      return { board, min };
    }
  }

  // ----- Game state -----
  const state = {
    initial: null,   // preserved starting board, for Reset
    board: null,     // current board
    minMoves: 0,
    moves: 0,
    solved: false,
    focus: 0
  };

  // ----- DOM -----
  const boardEl = document.getElementById('board');
  const minEl = document.getElementById('min-moves');
  const movesEl = document.getElementById('your-moves');
  const statusEl = document.getElementById('status');
  const resetBtn = document.getElementById('reset-btn');
  const newBtn = document.getElementById('new-btn');

  const cellEls = [];
  for (let r = 0; r < SIZE; r++) {
    const row = document.createElement('div');
    row.setAttribute('role', 'row');
    row.style.display = 'contents';
    for (let c = 0; c < SIZE; c++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'light';
      btn.setAttribute('role', 'gridcell');
      btn.dataset.r = r;
      btn.dataset.c = c;
      btn.tabIndex = -1;
      btn.addEventListener('click', () => onPress(r, c));
      btn.addEventListener('focus', () => { state.focus = r * SIZE + c; updateTabStops(); });
      row.appendChild(btn);
      cellEls.push(btn);
    }
    boardEl.appendChild(row);
  }

  // Arrow-key navigation (roving tabindex).
  boardEl.addEventListener('keydown', e => {
    const moves = { ArrowUp: -SIZE, ArrowDown: SIZE, ArrowLeft: -1, ArrowRight: 1 };
    if (!(e.key in moves)) return;
    e.preventDefault();
    let r = Math.floor(state.focus / SIZE), c = state.focus % SIZE;
    if (e.key === 'ArrowUp') r = Math.max(0, r - 1);
    if (e.key === 'ArrowDown') r = Math.min(SIZE - 1, r + 1);
    if (e.key === 'ArrowLeft') c = Math.max(0, c - 1);
    if (e.key === 'ArrowRight') c = Math.min(SIZE - 1, c + 1);
    state.focus = r * SIZE + c;
    updateTabStops();
    cellEls[state.focus].focus();
  });

  function updateTabStops() {
    cellEls.forEach((el, i) => { el.tabIndex = i === state.focus ? 0 : -1; });
  }

  function render() {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const el = cellEls[r * SIZE + c];
        const on = state.board[r][c];
        el.classList.toggle('on', on);
        el.setAttribute('aria-pressed', String(on));
        el.setAttribute('aria-label', `Row ${r + 1}, column ${c + 1}: ${on ? 'on' : 'off'}`);
        el.setAttribute('aria-disabled', String(state.solved));
        el.disabled = state.solved;
      }
    }
    boardEl.classList.toggle('solved', state.solved);
    minEl.textContent = state.minMoves;
    movesEl.textContent = state.moves;
    updateTabStops();
  }

  function setPlayingStatus() {
    const onCount = state.board.flat().filter(Boolean).length;
    statusEl.className = 'status';
    statusEl.innerHTML =
      `Press a light to toggle it and its neighbours above, below, left and right. ` +
      `<strong>${onCount}</strong> light${onCount === 1 ? '' : 's'} still on.`;
  }

  function setWinStatus() {
    const m = state.moves, min = state.minMoves;
    const plural = n => `${n} move${n === 1 ? '' : 's'}`;
    if (m <= min) {
      statusEl.className = 'status win optimal';
      statusEl.innerHTML = `<strong>Optimal Solution!</strong><br>You solved the puzzle in ${plural(m)}, matching the minimum.`;
    } else {
      statusEl.className = 'status win';
      statusEl.innerHTML = `<strong>Puzzle Solved!</strong><br>You used ${plural(m)}. The minimum was ${min}.`;
    }
  }

  function onPress(r, c) {
    if (state.solved) return;
    press(state.board, r, c);
    state.moves++;
    if (isAllOff(state.board)) {
      state.solved = true;
      render();
      setWinStatus();
      resetBtn.focus();
    } else {
      render();
      setPlayingStatus();
    }
  }

  function resetGame() {
    state.board = cloneBoard(state.initial);
    state.moves = 0;
    state.solved = false;
    render();
    setPlayingStatus();
  }

  function newGame() {
    const prev = state.initial ? boardToMask(state.initial) : -1;
    const { board, min } = generatePuzzle(prev);
    state.initial = cloneBoard(board);
    state.minMoves = min;   // fixed for the life of this puzzle
    resetGame();
  }

  resetBtn.addEventListener('click', resetGame);
  newBtn.addEventListener('click', newGame);

  newGame();
})();