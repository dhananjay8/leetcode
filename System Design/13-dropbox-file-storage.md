# Design Dropbox / Google Drive (File Storage System)

## 1. Requirements
- Upload, download, sync files across devices
- Share files/folders, versioning, conflict resolution
- Real-time sync with offline support

## 2. Architecture
```
Client (Desktop/Mobile) → Sync Service → Metadata Service → Metadata DB
                              ↓                                  ↓
                       Block Storage (S3)              Notification Service
```

## 3. Key Design: Chunked Upload & Sync
- Split files into **4MB chunks**, hash each chunk (SHA-256)
- Only upload/download **changed chunks** (deduplication)
- Metadata DB tracks: file → list of chunk hashes

### Sync Flow
1. Client detects file change → compute chunk hashes
2. Compare with server's chunk list → identify changed chunks
3. Upload only changed chunks to Block Storage
4. Update metadata (new chunk list, version++)
5. Notify other devices via long-polling/WebSocket

## 4. Conflict Resolution
- **Last-writer-wins** for simple cases
- **Branching**: If two devices edit simultaneously, create conflict copy
- User resolves manually (like Google Drive)

## 5. Data Models
```
files:      id, name, owner_id, parent_folder_id, size, version, updated_at
chunks:     file_id, chunk_index, hash, storage_url, size
versions:   file_id, version, chunk_list, created_at
shares:     file_id, user_id, permission (read/write)
```

## 6. Interview Talking Points
- Chunking + deduplication saves bandwidth and storage
- Content-addressable storage (hash as key)
- Delta sync (rsync-like) for efficiency
- Metadata DB (MySQL) separate from Block Storage (S3)
- Notification service for real-time multi-device sync
