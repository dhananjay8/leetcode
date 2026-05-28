"""
Problem 1 (DE Round - Easy, ~8 min)
"Given a stream of events, find the top-K most active users in the last 1 hour."

Pattern: Heap + Sliding Window
Time:  O(n log K) per query
Space: O(n) for the window

60-Second Identification:
  Core DS: stream → deque; ranking → heap
  Core Op: find top-K (rank/optimize)
  Constraint: real-time stream, time-based 1-hour window
  → Time-based Sliding Window + Min-Heap of size K
"""

import heapq
from collections import defaultdict, deque
from typing import List, Dict, Tuple


def top_k_active_users(
    events: List[Dict],
    k: int,
    window_ms: int = 3_600_000
) -> List[Tuple[str, int]]:
    """
    Args:
        events:    list of {userId, timestamp} dicts (unsorted ok)
        k:         number of top users to return
        window_ms: sliding window size in ms (default 1 hour)

    Returns:
        list of (userId, count) sorted by count descending
    """
    # Sort events by timestamp to process in chronological order
    events = sorted(events, key=lambda e: e["timestamp"])

    # Deque to maintain events within the current 1-hour window
    window: deque = deque()
    # Frequency map: userId -> count within current window
    freq: Dict[str, int] = defaultdict(int)

    for event in events:
        uid, ts = event["userId"], event["timestamp"]

        # Expand window: add current event to frequency map and deque
        freq[uid] += 1
        window.append(event)

        # Shrink window: remove events older than window_ms from the left
        # This maintains only events within the last 1-hour window
        while window and ts - window[0]["timestamp"] > window_ms:
            evicted = window.popleft()
            freq[evicted["userId"]] -= 1
            # Clean up users with zero count to keep freq map lean
            if freq[evicted["userId"]] == 0:
                del freq[evicted["userId"]]

    # freq now represents activity in the window ending at the last event
    # Use min-heap of size k to efficiently find top-K users
    # Heap stores (count, uid) — min-heap property keeps smallest at top
    heap = []
    for uid, count in freq.items():
        heapq.heappush(heap, (count, uid))
        # If heap exceeds size k, evict the smallest (least active)
        # This ensures heap always contains the K most active users
        if len(heap) > k:
            heapq.heappop(heap)  # remove minimum

    # Sort heap in descending order by count for final result
    result = sorted(heap, key=lambda x: -x[0])
    return [(uid, count) for count, uid in result]


# ── Tests ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import time
    now = int(time.time() * 1000)

    events = [
        {"userId": "alice",   "timestamp": now - 3_500_000},
        {"userId": "bob",     "timestamp": now - 3_000_000},
        {"userId": "alice",   "timestamp": now - 2_000_000},
        {"userId": "charlie", "timestamp": now - 1_500_000},
        {"userId": "alice",   "timestamp": now -   500_000},
        {"userId": "bob",     "timestamp": now -   400_000},
        {"userId": "bob",     "timestamp": now -   100_000},
        {"userId": "dave",    "timestamp": now -    50_000},
    ]

    print("Top 2 active users:", top_k_active_users(events, 2))
    # Expected: [("bob", 3), ("alice", 2)] — both within 1 hour window
