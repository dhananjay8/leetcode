# Build a Polling / Voting System

## Requirements
- Create poll with question + multiple options
- Vote on a poll (one vote per user)
- Real-time results with percentage bars
- Show results after voting

## Implementation
```javascript
function Poll({ question, options: initialOptions, onVote }) {
  const [options, setOptions] = useState(initialOptions);
  const [voted, setVoted] = useState(false);
  const [selected, setSelected] = useState(null);
  const totalVotes = options.reduce((sum, o) => sum + o.votes, 0);

  const handleVote = () => {
    if (selected === null) return;
    setOptions(prev => prev.map((o, i) => i === selected ? { ...o, votes: o.votes + 1 } : o));
    setVoted(true);
    onVote?.(selected);
  };

  return (
    <div className="poll">
      <h3>{question}</h3>
      {options.map((option, i) => {
        const percent = totalVotes ? Math.round((option.votes / totalVotes) * 100) : 0;
        return (
          <div key={i} className="option" onClick={() => !voted && setSelected(i)}>
            {!voted ? (
              <label><input type="radio" checked={selected === i} readOnly /> {option.text}</label>
            ) : (
              <div className="result">
                <span>{option.text} — {percent}%</span>
                <div className="bar" style={{ width: `${percent}%` }} />
                <span>{option.votes} votes</span>
              </div>
            )}
          </div>
        );
      })}
      {!voted && <button onClick={handleVote} disabled={selected === null}>Vote</button>}
      {voted && <p>Total votes: {totalVotes + 1}</p>}
    </div>
  );
}
```

## Key Patterns
- **Before vote**: radio buttons for selection
- **After vote**: show results with animated percentage bars
- **Prevent double-voting**: `voted` state (server-side: check user_id)
- **Real-time updates**: WebSocket or polling for live vote counts
- **CSS transitions** on bar width for smooth animation
