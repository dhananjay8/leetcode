# Design a Web Crawler

## 1. Requirements
- Crawl billions of web pages starting from seed URLs
- Extract content, follow links, avoid duplicates
- Respect robots.txt, politeness (don't overload servers)

## 2. Architecture
```
Seed URLs → URL Frontier (priority queue) → Fetcher Workers → Content Parser
                 ↑                                                  ↓
            URL Filter ← Dedup (Bloom Filter) ← Link Extractor ← Store (S3)
```

## 3. Core Components

### URL Frontier
- Priority queue: important domains first, fresh content first
- **Politeness**: per-domain queue with delay between requests (1-5 sec)
- **Freshness**: re-crawl popular pages more frequently

### Fetcher
- Multi-threaded workers, each assigned a domain
- Parse robots.txt before crawling any domain
- Handle: redirects, timeouts, retries, HTTP status codes

### Deduplication
- **URL dedup**: Bloom filter (O(1) lookup, small memory, false positives OK)
- **Content dedup**: SimHash or MinHash fingerprints to detect near-duplicate pages

### Storage
- Raw HTML → S3 / HDFS
- Parsed content → Elasticsearch for indexing
- Link graph → Graph database or adjacency list

## 4. Scaling
- Partition URL frontier by domain hash
- Distribute fetchers across regions (crawl local content from nearby DCs)
- Use DNS cache to avoid repeated DNS lookups
- Kafka for async communication between components

## 5. Interview Talking Points
- **BFS vs DFS**: BFS preferred (breadth of coverage before depth)
- **Bloom filter** is the go-to for URL dedup at scale
- **Politeness** is critical — getting IP-banned defeats the purpose
- URL normalization: lowercase, remove fragments, resolve relative URLs
- Trap detection: infinite calendar pages, session IDs in URLs
