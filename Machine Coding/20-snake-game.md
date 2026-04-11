# Build a Snake Game

## Requirements
- Snake moves on grid, grows when eating food
- Game over on wall collision or self-collision
- Score tracking, speed increases with score
- Arrow keys for direction control

## Implementation

```javascript
const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 200;

function SnakeGame() {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState({ x: 1, y: 0 }); // moving right
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  // Place food at random position (not on snake)
  const placeFood = useCallback(() => {
    let newFood;
    do {
      newFood = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };
    } while (snake.some(s => s.x === newFood.x && s.y === newFood.y));
    setFood(newFood);
  }, [snake]);

  // Handle keyboard input
  useEffect(() => {
    const handleKey = (e) => {
      const key = e.key;
      if (key === 'ArrowUp' && direction.y === 0)    setDirection({ x: 0, y: -1 });
      if (key === 'ArrowDown' && direction.y === 0)   setDirection({ x: 0, y: 1 });
      if (key === 'ArrowLeft' && direction.x === 0)   setDirection({ x: -1, y: 0 });
      if (key === 'ArrowRight' && direction.x === 0)  setDirection({ x: 1, y: 0 });
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [direction]);

  // Game loop
  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setSnake(prev => {
        const head = { x: prev[0].x + direction.x, y: prev[0].y + direction.y };

        // Wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameOver(true); return prev;
        }
        // Self collision
        if (prev.some(s => s.x === head.x && s.y === head.y)) {
          setGameOver(true); return prev;
        }

        const newSnake = [head, ...prev];
        // Eat food
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 1);
          placeFood();
        } else {
          newSnake.pop(); // remove tail if no food eaten
        }
        return newSnake;
      });
    }, Math.max(50, INITIAL_SPEED - score * 5)); // speed up with score

    return () => clearInterval(timer);
  }, [direction, food, gameOver, score]);

  return (
    <div>
      <h2>Score: {score} {gameOver && '- GAME OVER!'}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)` }}>
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
          const x = i % GRID_SIZE, y = Math.floor(i / GRID_SIZE);
          const isSnake = snake.some(s => s.x === x && s.y === y);
          const isFood = food.x === x && food.y === y;
          return <div key={i} style={{
            width: CELL_SIZE, height: CELL_SIZE,
            background: isSnake ? '#22c55e' : isFood ? '#ef4444' : '#1e293b',
            border: '1px solid #334155'
          }} />;
        })}
      </div>
    </div>
  );
}
```

## Key Patterns
- **Game loop** with setInterval (speed adjusts with score)
- **State**: snake as array of {x,y}, head at index 0
- **Direction guard**: prevent 180° turn (can't go left if going right)
- **Collision detection**: check head against walls and body
- **Food placement**: random position not overlapping snake

## Interview Tips
- Start with data structures (snake array, direction vector)
- Game loop with cleanup (clearInterval)
- Mention: requestAnimationFrame for smoother animation in production
- Bonus features: pause, high score, grid wrap-around mode
