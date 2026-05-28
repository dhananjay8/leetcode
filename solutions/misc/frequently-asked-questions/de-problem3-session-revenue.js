/**
 * Problem 3 (DE Round - Hard, ~18 min)
 * "Group user events into sessions, where a session ends after 30 minutes of
 *  inactivity. Compute revenue per session."
 *
 * Pattern: Sorting + Interval Merging + Windowing
 * Time:  O(n log n) — dominated by sort
 * Space: O(n) for session output
 *
 * 60-Second Identification:
 *   Core DS: events per user → sorted timeline per user
 *   Core Op: group (merge intervals) + aggregate (sum revenue)
 *   Constraint: 30-min inactivity gap defines session boundary
 *   → Sort by (userId, timestamp), then merge intervals with gap threshold
 *
 * Production equivalent: sessionisation in Spark/Flink window functions
 */

const SESSION_GAP_MS = 30 * 60 * 1000; // 30 minutes

/**
 * @typedef {{userId: string, timestamp: number, revenue: number}} Event
 * @typedef {{userId: string, sessionId: string, start: number, end: number, revenue: number, eventCount: number}} Session
 */

/**
 * @param {Event[]} events
 * @returns {Session[]}
 */
function sessioniseAndComputeRevenue(events) {
  if (!events.length) return [];

  // 1. Sort by userId, then timestamp (stable grouping)
  events.sort((a, b) => a.userId !== b.userId
    ? a.userId.localeCompare(b.userId)
    : a.timestamp - b.timestamp
  );

  const sessions = [];
  let sessionIdx = 0;

  let i = 0;
  while (i < events.length) {
    const userId = events[i].userId;

    // Start new session
    let sessionStart = events[i].timestamp;
    let sessionEnd   = events[i].timestamp;
    let revenue      = events[i].revenue;
    let eventCount   = 1;

    // 2. Merge events within the same user and within SESSION_GAP_MS of last event
    let j = i + 1;
    while (j < events.length && events[j].userId === userId) {
      if (events[j].timestamp - sessionEnd <= SESSION_GAP_MS) {
        // Same session — extend
        sessionEnd = events[j].timestamp;
        revenue += events[j].revenue;
        eventCount++;
        j++;
      } else {
        // Gap exceeded — close session
        break;
      }
    }

    sessions.push({
      userId,
      sessionId: `${userId}-S${++sessionIdx}`,
      start: sessionStart,
      end: sessionEnd,
      durationMin: Math.round((sessionEnd - sessionStart) / 60000),
      revenue: Math.round(revenue * 100) / 100,
      eventCount,
    });

    i = j;
  }

  return sessions;
}

// ─── Tests ───────────────────────────────────────────────────────────────────
const now = Date.now();
const MIN = 60_000;

const events = [
  // alice: 2 sessions (gap > 30 min between event 2 and 3)
  { userId: "alice", timestamp: now - 120 * MIN, revenue: 10.00 },
  { userId: "alice", timestamp: now - 110 * MIN, revenue: 5.50  },
  { userId: "alice", timestamp: now -  70 * MIN, revenue: 8.00  }, // 40 min gap → new session
  { userId: "alice", timestamp: now -  60 * MIN, revenue: 12.00 },

  // bob: 1 session
  { userId: "bob",   timestamp: now -  90 * MIN, revenue: 20.00 },
  { userId: "bob",   timestamp: now -  75 * MIN, revenue: 3.00  }, // 15 min gap → same session

  // charlie: 1 event, 1 session
  { userId: "charlie", timestamp: now - 10 * MIN, revenue: 100.00 },
];

const result = sessioniseAndComputeRevenue(events);
result.forEach(s => console.log(
  `${s.sessionId} | events: ${s.eventCount} | duration: ${s.durationMin}m | revenue: $${s.revenue}`
));
/*
  alice-S1  | events: 2 | duration: 10m  | revenue: $15.5
  alice-S2  | events: 2 | duration: 10m  | revenue: $20
  bob-S3    | events: 2 | duration: 15m  | revenue: $23
  charlie-S4| events: 1 | duration: 0m   | revenue: $100
*/

module.exports = { sessioniseAndComputeRevenue };
