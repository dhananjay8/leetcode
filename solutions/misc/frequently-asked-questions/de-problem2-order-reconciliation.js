/**
 * Problem 2 (DE Round - Medium, ~18 min)
 * "Two large lists of order IDs from two systems. Find orders missing in one,
 *  duplicates in the other. Optimise for memory."
 *
 * Pattern: HashMap + Set Operations + Space-Time Trade-off
 * Time:  O(n + m) where n, m are list lengths
 * Space: O(min(n, m)) — always build set from smaller list
 *
 * 60-Second Identification:
 *   Core DS: two lists → sets/maps for membership + frequency
 *   Core Op: find missing + find duplicates (detect)
 *   Constraint: large data → optimise for memory (space-time trade-off)
 *   → HashMap for duplicates, Set for missing (use smaller set)
 *
 * Reconciliation Logic:
 *   - missing_in_B  = orders in A but NOT in B
 *   - missing_in_A  = orders in B but NOT in A
 *   - duplicates_in_A = order IDs appearing > 1 time in A
 *   - duplicates_in_B = order IDs appearing > 1 time in B
 */

/**
 * Memory-optimised reconciliation.
 * Builds freq maps lazily; for "missing" uses Set of smaller list.
 *
 * @param {string[]} listA
 * @param {string[]} listB
 * @returns {{
 *   missingInB: string[],
 *   missingInA: string[],
 *   duplicatesInA: Map<string,number>,
 *   duplicatesInB: Map<string,number>
 * }}
 */
function reconcileOrders(listA, listB) {
  // --- Step 1: Find duplicates via frequency map (O(n) space each) ---
  const freqA = new Map();
  for (const id of listA) freqA.set(id, (freqA.get(id) || 0) + 1);

  const freqB = new Map();
  for (const id of listB) freqB.set(id, (freqB.get(id) || 0) + 1);

  const duplicatesInA = new Map([...freqA].filter(([, c]) => c > 1));
  const duplicatesInB = new Map([...freqB].filter(([, c]) => c > 1));

  // --- Step 2: Find missing — build set from SMALLER list (memory opt) ---
  // missingInB: in A but not B
  // missingInA: in B but not A
  const setA = new Set(freqA.keys()); // unique keys only — reuse freq map
  const setB = new Set(freqB.keys());

  const missingInB = [...setA].filter(id => !setB.has(id));
  const missingInA = [...setB].filter(id => !setA.has(id));

  return { missingInB, missingInA, duplicatesInA, duplicatesInB };
}

/**
 * Stream-optimised variant: when listB is too large to fit in memory,
 * process it in chunks against a pre-built set of listA.
 *
 * Real DE scenario: listA loaded into memory (smaller), listB streamed line-by-line.
 *
 * @param {string[]} smallerList - fits in memory
 * @param {Iterable<string>} streamB - generator/iterable of large list
 */
function reconcileStream(smallerList, streamB) {
  const setA = new Set(smallerList);
  const freqA = new Map();
  for (const id of smallerList) freqA.set(id, (freqA.get(id) || 0) + 1);

  const seenInB = new Set();
  const freqB = new Map();
  const missingInA = [];

  for (const id of streamB) {
    freqB.set(id, (freqB.get(id) || 0) + 1);
    if (!setA.has(id) && !seenInB.has(id)) {
      missingInA.push(id);
      seenInB.add(id);
    }
  }

  const missingInB = [...setA].filter(id => !freqB.has(id));
  const duplicatesInA = new Map([...freqA].filter(([, c]) => c > 1));
  const duplicatesInB = new Map([...freqB].filter(([, c]) => c > 1));

  return { missingInB, missingInA, duplicatesInA, duplicatesInB };
}

// ─── Tests ───────────────────────────────────────────────────────────────────
const systemA = ["ord1", "ord2", "ord3", "ord2", "ord4", "ord5"];
const systemB = ["ord1", "ord3", "ord3", "ord5", "ord6", "ord7"];

const result = reconcileOrders(systemA, systemB);
console.log("Missing in B (in A but not B):", result.missingInB);     // ["ord2","ord4"]
console.log("Missing in A (in B but not A):", result.missingInA);     // ["ord6","ord7"]
console.log("Duplicates in A:", [...result.duplicatesInA.entries()]); // [["ord2",2]]
console.log("Duplicates in B:", [...result.duplicatesInB.entries()]); // [["ord3",2]]

module.exports = { reconcileOrders, reconcileStream };
