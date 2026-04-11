# Build a Spreadsheet (like Google Sheets)

## Requirements
- Grid of editable cells (rows × columns)
- Cell references: typing `=A1+B2` evaluates the formula
- Formatting: bold, color, alignment
- Selection, copy/paste, undo/redo

## Data Model
```javascript
// cells stored as { "A1": { value: "Hello", formula: null }, "B1": { value: 10, formula: "=A2+5" } }
const [cells, setCells] = useState({});
const getCellId = (row, col) => `${String.fromCharCode(65 + col)}${row + 1}`; // "A1", "B2"
```

## Core: Formula Evaluation
```javascript
function evaluateFormula(formula, cells) {
  if (!formula.startsWith('=')) return formula;
  let expr = formula.slice(1); // remove '='

  // Replace cell references (A1, B2, etc.) with their values
  expr = expr.replace(/([A-Z])(\d+)/g, (match) => {
    const val = cells[match]?.value;
    return isNaN(val) ? 0 : Number(val);
  });

  try { return eval(expr); } // caution: use a safe math parser in production
  catch { return '#ERROR'; }
}
```

## Grid Rendering
```javascript
function Spreadsheet({ rows = 50, cols = 26 }) {
  const [cells, setCells] = useState({});
  const [editing, setEditing] = useState(null);

  const updateCell = (id, rawValue) => {
    const value = rawValue.startsWith('=') ? evaluateFormula(rawValue, cells) : rawValue;
    setCells(prev => ({ ...prev, [id]: { value, formula: rawValue } }));
    setEditing(null);
  };

  return (
    <table>
      <tbody>
        {Array.from({ length: rows }, (_, r) => (
          <tr key={r}>
            {Array.from({ length: cols }, (_, c) => {
              const id = getCellId(r, c);
              return (
                <td key={id} onDoubleClick={() => setEditing(id)}>
                  {editing === id ? (
                    <input autoFocus defaultValue={cells[id]?.formula || cells[id]?.value || ''}
                           onBlur={e => updateCell(id, e.target.value)}
                           onKeyDown={e => e.key === 'Enter' && updateCell(id, e.target.value)} />
                  ) : (cells[id]?.value ?? '')}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Key Patterns
- **Cell as object**: `{ value, formula }` — display value, store formula
- **Formula parsing**: regex to find cell references, replace with values
- **Dependency graph** for reactive updates (when A1 changes, recalculate cells that reference A1)
- **Virtualization** is critical for performance with large grids

## Interview Tips
- Start simple: editable grid → add formulas → add formatting
- Mention circular dependency detection for formulas
- Use safe math parser (not eval) in production
