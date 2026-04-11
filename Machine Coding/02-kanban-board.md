# Build a Kanban Board (Drag & Drop)

## Requirements
- Columns: Todo, In Progress, Done (customizable)
- Add/edit/delete cards
- Drag and drop cards between columns
- Persist state

## Data Model
```javascript
const board = {
  columns: {
    'todo': { id: 'todo', title: 'To Do', cardIds: ['c1', 'c2'] },
    'in-progress': { id: 'in-progress', title: 'In Progress', cardIds: ['c3'] },
    'done': { id: 'done', title: 'Done', cardIds: [] }
  },
  cards: {
    'c1': { id: 'c1', title: 'Design API', description: '...', priority: 'high' },
    'c2': { id: 'c2', title: 'Write tests', description: '...', priority: 'low' }
  },
  columnOrder: ['todo', 'in-progress', 'done']
};
```

## Drag & Drop Implementation

### Using HTML5 Drag API
```javascript
// Card component
const Card = ({ card, columnId }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('cardId', card.id);
    e.dataTransfer.setData('sourceColumn', columnId);
  };
  return <div draggable onDragStart={handleDragStart}>{card.title}</div>;
};

// Column component
const Column = ({ column, cards, onDrop }) => {
  const handleDragOver = (e) => e.preventDefault(); // allow drop
  const handleDrop = (e) => {
    const cardId = e.dataTransfer.getData('cardId');
    const sourceCol = e.dataTransfer.getData('sourceColumn');
    onDrop(cardId, sourceCol, column.id);
  };
  return (
    <div onDragOver={handleDragOver} onDrop={handleDrop}>
      <h3>{column.title}</h3>
      {cards.map(card => <Card key={card.id} card={card} columnId={column.id} />)}
    </div>
  );
};
```

### Move Logic
```javascript
const moveCard = (cardId, sourceColId, destColId) => {
  setBoard(prev => {
    const newBoard = { ...prev, columns: { ...prev.columns } };
    // Remove from source
    newBoard.columns[sourceColId] = {
      ...prev.columns[sourceColId],
      cardIds: prev.columns[sourceColId].cardIds.filter(id => id !== cardId)
    };
    // Add to destination
    newBoard.columns[destColId] = {
      ...prev.columns[destColId],
      cardIds: [...prev.columns[destColId].cardIds, cardId]
    };
    return newBoard;
  });
};
```

## Interview Tips
- Normalize data (separate cards and columns, reference by ID)
- Use `react-beautiful-dnd` or HTML5 drag API
- Handle edge cases: drop on same column, empty columns
- Responsive design: stack columns on mobile
