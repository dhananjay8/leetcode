# Design a Video Streaming Platform (YouTube/Netflix)

## 1. Requirements

### Functional
- Upload, process, and store videos
- Stream video with adaptive bitrate
- Search, recommendations, comments, likes
- Watch history, subscriptions

### Non-Functional
- Low buffering, smooth playback globally
- Support 1B+ daily video views
- Handle large files (up to several GB)

---

## 2. High-Level Architecture

```
Upload: Creator → Upload Service → Object Store (S3) → Transcoding Pipeline → CDN

Stream: Viewer → CDN (edge cache) → Origin Server → Object Store
                     ↕
              Adaptive Bitrate Selection
```

---

## 3. Video Upload & Processing Pipeline

1. **Upload**: Chunked upload to S3 (resumable)
2. **Transcoding**: Convert to multiple resolutions (240p, 480p, 720p, 1080p, 4K)
3. **Encoding**: H.264/H.265, VP9, AV1 codecs
4. **Segmentation**: Split into small chunks (2-10 seconds) for adaptive streaming
5. **Thumbnail generation**: Extract frames at intervals
6. **Storage**: Store all versions in S3, metadata in DB

### Transcoding Architecture
```
Upload Service → Message Queue (SQS/Kafka) → Transcoding Workers (FFmpeg)
                                                      ↓
                                              Multiple quality outputs → S3
```

---

## 4. Video Streaming (Adaptive Bitrate)

### HLS (HTTP Live Streaming) / DASH
- Video split into segments + manifest file (.m3u8 / .mpd)
- Client requests manifest → downloads segments sequentially
- Dynamically switches quality based on bandwidth

### CDN Strategy
- **Edge caching**: Popular videos cached at edge nodes globally
- **Origin shield**: Intermediate cache layer to protect origin
- **Pre-warming**: Push trending videos to CDN edges proactively

---

## 5. Data Models

```
videos:       id, title, description, user_id, url, status, duration, upload_date
video_files:  video_id, resolution, codec, url, size
users:        id, name, subscribers_count, channel_info
comments:     id, video_id, user_id, text, created_at
watch_history: user_id, video_id, watched_at, progress_seconds
```

---

## 6. Recommendation System

- **Collaborative filtering**: Users who watched X also watched Y
- **Content-based**: Similar tags, categories, creators
- **Real-time signals**: Watch time, likes, completion rate
- **ML Pipeline**: Kafka → Feature Store → Model Serving → API

---

## 7. Key Design Decisions

| Feature | Design |
|---------|--------|
| Upload | Chunked, resumable, pre-signed URLs |
| Transcoding | Async workers, horizontal scaling |
| Streaming | HLS/DASH adaptive bitrate via CDN |
| Search | Elasticsearch (title, tags, transcripts) |
| Thumbnails | Auto-generated + user-selected |
| Copyright | Content fingerprinting (Content ID) |

---

## 8. Interview Talking Points

- Transcoding pipeline is the most critical async component
- CDN is essential — most reads should never hit origin
- Adaptive bitrate streaming for varying network conditions
- Cost optimization: popular videos on CDN, long-tail on cold storage
- Live streaming: low-latency HLS, WebRTC for ultra-low latency
