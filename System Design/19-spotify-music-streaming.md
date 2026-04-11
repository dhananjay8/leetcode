# How Spotify / Music Streaming Works

## 1. Requirements
- Stream millions of songs with low latency
- Personalized playlists and recommendations
- Offline downloads, search, social sharing
- Handle 500M+ users, 100M+ tracks

## 2. Architecture
```
Client → CDN (audio files) → API Gateway
                                   ↓
              ┌────────────────────┼────────────────┐
              ↓                    ↓                ↓
        Music Service      Recommendation     Search Service
              ↓              Engine              (Elasticsearch)
        Audio Storage        ↓
        (S3 + CDN)     ML Pipeline
```

## 3. Audio Streaming
- Songs stored in multiple bitrates (96, 160, 320 kbps) and formats (OGG Vorbis, AAC)
- **Adaptive bitrate**: Client switches quality based on network speed
- **CDN distribution**: Popular songs cached at edge locations worldwide
- **Pre-buffering**: Client fetches next track while current is playing (gapless playback)

## 4. Recommendation System
- **Collaborative Filtering**: Users who liked X also liked Y
- **Audio Analysis**: ML models analyze tempo, key, energy of tracks
- **Natural Language Processing**: Analyze blogs, reviews to understand music context
- **Discover Weekly**: Blend of all models, personalized per user

## 5. Key Design Decisions
| Component | Choice |
|-----------|--------|
| Audio storage | S3 with CloudFront CDN |
| Metadata | PostgreSQL (tracks, artists, albums) |
| User activity | Cassandra (billions of play events) |
| Search | Elasticsearch |
| Recommendations | Apache Spark + TensorFlow |
| Real-time events | Kafka (play events, skips, likes) |

## 6. Interview Talking Points
- CDN is critical — most audio should be served from edge
- Multiple bitrate encodings for adaptive streaming
- Offline mode: DRM-encrypted downloads with license validation
- Royalty tracking: every play event logged to compute artist payments
