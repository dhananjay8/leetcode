# Build a File Explorer (like VS Code)

## Requirements
- Tree view of folders and files
- Expand/collapse folders, click to select file
- Create, rename, delete files/folders
- Context menu (right-click), keyboard navigation

## Data Model
```javascript
const fileTree = {
  id: 'root', name: 'project', type: 'folder', children: [
    { id: '1', name: 'src', type: 'folder', children: [
      { id: '2', name: 'index.js', type: 'file' },
      { id: '3', name: 'App.js', type: 'file' },
    ]},
    { id: '4', name: 'README.md', type: 'file' },
  ]
};
```

## Core Implementation
```javascript
function FileNode({ node, depth = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const isFolder = node.type === 'folder';

  return (
    <div>
      <div style={{ paddingLeft: depth * 16 }} onClick={() => isFolder && setExpanded(!expanded)}>
        {isFolder ? (expanded ? '📂' : '📁') : '📄'} {node.name}
      </div>
      {expanded && node.children?.map(child => (
        <FileNode key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}
```

## Key Patterns
- **Recursive component** for nested tree rendering
- **Controlled expand/collapse** state (or store in a Set of expanded IDs)
- **Context menu**: Listen for `onContextMenu`, render dropdown at cursor position
- **Virtualization** for large trees (react-window)
- **Drag & drop** for moving files between folders

## Interview Tips
- Data structure: tree with parent references enables efficient operations
- Lazy loading: fetch children on expand for large file systems
- Keyboard: ArrowUp/Down to navigate, Enter to open, ArrowRight/Left to expand/collapse
