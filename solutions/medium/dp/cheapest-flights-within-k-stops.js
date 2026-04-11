/**
 * Problem: Cheapest Flights Within K Stops
 * Link: https://leetcode.com/problems/cheapest-flights-within-k-stops/
 * Difficulty: Medium
 *
 * Find cheapest price from src to dst with at most k stops.
 *
 * Time Complexity: O(k * E)
 * Space Complexity: O(n)
 */

// JavaScript Solution - Bellman-Ford variant
function findCheapestPrice(n, flights, src, dst, k) {
  let prices = new Array(n).fill(Infinity);
  prices[src] = 0;

  // Relax edges k+1 times (k stops = k+1 edges)
  for (let i = 0; i <= k; i++) {
    const temp = [...prices]; // copy to avoid using updated values in same round
    for (const [from, to, cost] of flights) {
      if (prices[from] === Infinity) continue;
      temp[to] = Math.min(temp[to], prices[from] + cost);
    }
    prices = temp;
  }

  return prices[dst] === Infinity ? -1 : prices[dst];
}

module.exports = findCheapestPrice;

/* Python Solution:

def findCheapestPrice(n, flights, src, dst, k):
    prices = [float('inf')] * n
    prices[src] = 0
    
    for _ in range(k + 1):
        temp = prices[:]
        for fr, to, cost in flights:
            if prices[fr] != float('inf'):
                temp[to] = min(temp[to], prices[fr] + cost)
        prices = temp
    
    return prices[dst] if prices[dst] != float('inf') else -1

*/
