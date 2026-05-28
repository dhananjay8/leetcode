"""
Problem 3 (DE Round - Hard, ~18 min)
"Group user events into sessions, where a session ends after 30 minutes of
 inactivity. Compute revenue per session."

Pattern: Sorting + Interval Merging + Windowing
Time:  O(n log n) — dominated by sort
Space: O(n)

60-Second Identification:
  Core DS: events per user → sorted timeline
  Core Op: group (merge) + aggregate (sum)
  Constraint: 30-min inactivity gap defines boundary
  → Sort by (userId, timestamp), merge with gap threshold, aggregate revenue

Production equivalent: Spark window functions with session_window()
"""

from typing import List, Dict, Any
from itertools import groupby

SESSION_GAP_S = 30 * 60  # 30 minutes in seconds


def sessionise_and_compute_revenue(events: List[Dict]) -> List[Dict]:
    """
    Args:
        events: list of {userId, timestamp (epoch seconds), revenue}

    Returns:
        list of session dicts with userId, sessionId, start, end, duration_min,
        revenue, event_count
    """
    if not events:
        return []

    # 1. Sort by userId then timestamp to group events chronologically per user
    events = sorted(events, key=lambda e: (e["userId"], e["timestamp"]))

    sessions = []
    session_idx = 0

    # 2. Group by userId, then merge events within 30-min gap into sessions
    for user_id, user_events in groupby(events, key=lambda e: e["userId"]):
        user_events = list(user_events)

        # Initialize first session with the first event for this user
        session_start  = user_events[0]["timestamp"]
        session_end    = user_events[0]["timestamp"]
        session_rev    = user_events[0]["revenue"]
        event_count    = 1

        # Process remaining events for this user
        for event in user_events[1:]:
            # If gap between current event and session end is <= 30 min, extend session
            if event["timestamp"] - session_end <= SESSION_GAP_S:
                # Extend current session: update end time, add revenue, increment count
                session_end  = event["timestamp"]
                session_rev += event["revenue"]
                event_count += 1
            else:
                # Gap exceeded: close current session and start a new one
                session_idx += 1
                sessions.append({
                    "userId":       user_id,
                    "sessionId":    f"{user_id}-S{session_idx}",
                    "start":        session_start,
                    "end":          session_end,
                    "duration_min": round((session_end - session_start) / 60),
                    "revenue":      round(session_rev, 2),
                    "event_count":  event_count,
                })
                # Reset session tracking for the new session
                session_start = event["timestamp"]
                session_end   = event["timestamp"]
                session_rev   = event["revenue"]
                event_count   = 1

        # Flush the last session for this user (after loop ends)
        session_idx += 1
        sessions.append({
            "userId":       user_id,
            "sessionId":    f"{user_id}-S{session_idx}",
            "start":        session_start,
            "end":          session_end,
            "duration_min": round((session_end - session_start) / 60),
            "revenue":      round(session_rev, 2),
            "event_count":  event_count,
        })

    return sessions


# ── Tests ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import time
    now = int(time.time())
    M = 60  # 1 minute in seconds

    events = [
        # alice: 2 sessions (gap > 30 min between event 2 and 3)
        {"userId": "alice",   "timestamp": now - 120*M, "revenue": 10.00},
        {"userId": "alice",   "timestamp": now - 110*M, "revenue": 5.50},
        {"userId": "alice",   "timestamp": now -  70*M, "revenue": 8.00},  # 40m gap
        {"userId": "alice",   "timestamp": now -  60*M, "revenue": 12.00},

        # bob: 1 session
        {"userId": "bob",     "timestamp": now -  90*M, "revenue": 20.00},
        {"userId": "bob",     "timestamp": now -  75*M, "revenue": 3.00},

        # charlie: single event
        {"userId": "charlie", "timestamp": now -  10*M, "revenue": 100.00},
    ]

    result = sessionise_and_compute_revenue(events)
    for s in result:
        print(f"{s['sessionId']} | events: {s['event_count']} | "
              f"duration: {s['duration_min']}m | revenue: ${s['revenue']}")
