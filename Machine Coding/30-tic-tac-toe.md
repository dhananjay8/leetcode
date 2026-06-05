# Build a Tic-Tac-Toe Game

## Requirements
- Render a 3x3 board
- Alternate turns between X and O
- Detect winner and draw
- Support reset and move history

## Implementation
```javascript
import { useMemo, useState } from 'react';

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function getWinner(board) {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

function TicTacToe() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [step, setStep] = useState(0);
  const board = history[step];
  const winner = useMemo(() => getWinner(board), [board]);
  const isDraw = !winner && board.every(Boolean);
  const nextPlayer = step % 2 === 0 ? 'X' : 'O';

  const playMove = (index) => {
    if (board[index] || winner) return;

    const nextBoard = [...board];
    nextBoard[index] = nextPlayer;
    const nextHistory = history.slice(0, step + 1);
    setHistory([...nextHistory, nextBoard]);
    setStep(step + 1);
  };

  const reset = () => {
    setHistory([Array(9).fill(null)]);
    setStep(0);
  };

  return (
    <div>
      <p>{winner ? `Winner: ${winner}` : isDraw ? 'Draw' : `Next: ${nextPlayer}`}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 48px)' }}>
        {board.map((cell, index) => (
          <button key={index} onClick={() => playMove(index)} disabled={Boolean(cell) || Boolean(winner)}>
            {cell}
          </button>
        ))}
      </div>
      <button onClick={reset}>Reset</button>
      <ol>
        {history.map((_, index) => (
          <li key={index}>
            <button onClick={() => setStep(index)}>Go to move {index}</button>
          </li>
        ))}
      </ol>
    </div>
  );
}
```

## Key Patterns
- **Immutable board updates**: clone board before move
- **Winner detection**: constant list of winning lines
- **History**: slice future moves after time travel
- **Derived state**: winner, draw, and next player are computed

## Interview Tips
- Start with board state before UI polish
- Keep win logic separate and testable
- Mention generalized N x N board as an extension
