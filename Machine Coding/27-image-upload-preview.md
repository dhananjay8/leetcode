# Build an Image Upload with Preview

## Requirements
- Select one or more image files
- Validate file type and size
- Show local previews before upload
- Remove selected files and clean object URLs

## Implementation
```javascript
import { useEffect, useState } from 'react';

function ImageUploadPreview({ maxSizeMb = 5, multiple = true }) {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    const validFiles = [];
    setError('');

    for (const file of selectedFiles) {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        continue;
      }
      if (file.size > maxSizeMb * 1024 * 1024) {
        setError(`Each file must be smaller than ${maxSizeMb}MB`);
        continue;
      }
      validFiles.push({ id: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file) });
    }

    setFiles(prev => multiple ? [...prev, ...validFiles] : validFiles.slice(0, 1));
    event.target.value = '';
  };

  const removeFile = (id) => {
    setFiles(prev => {
      const fileToRemove = prev.find(item => item.id === id);
      if (fileToRemove) URL.revokeObjectURL(fileToRemove.previewUrl);
      return prev.filter(item => item.id !== id);
    });
  };

  useEffect(() => {
    return () => files.forEach(item => URL.revokeObjectURL(item.previewUrl));
  }, [files]);

  return (
    <div>
      <input type="file" accept="image/*" multiple={multiple} onChange={handleChange} />
      {error && <p role="alert">{error}</p>}
      <ul>
        {files.map(item => (
          <li key={item.id}>
            <img src={item.previewUrl} alt={item.file.name} width={120} />
            <button onClick={() => removeFile(item.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Key Patterns
- **Object URLs**: preview local files without upload
- **Cleanup**: call `URL.revokeObjectURL`
- **Validation**: type and size before adding
- **Reset input**: allow reselecting the same file

## Interview Tips
- Discuss drag-and-drop as an extension
- Mention server upload progress and retry
- Do not base validation only on filename extension
