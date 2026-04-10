/**
 * Problem: Car Fleet
 * Link: https://leetcode.com/problems/car-fleet/
 * Difficulty: Medium
 *
 * N cars heading to target. Return number of car fleets.
 * A fleet forms when a faster car catches up to a slower one.
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */

// JavaScript Solution - Sort + Stack
function carFleet(target, position, speed) {
  // Pair position and speed, sort by position descending (closest to target first)
  const cars = position
    .map((pos, i) => [pos, speed[i]])
    .sort((a, b) => b[0] - a[0]);

  const stack = []; // stack of arrival times

  for (const [pos, spd] of cars) {
    const arrivalTime = (target - pos) / spd;

    // If this car arrives later than the car ahead, it forms a new fleet
    if (!stack.length || arrivalTime > stack[stack.length - 1]) {
      stack.push(arrivalTime);
    }
    // Otherwise, it joins the fleet ahead (arrives sooner, gets blocked)
  }

  return stack.length; // number of fleets
}

module.exports = carFleet;

/* Python Solution:

def carFleet(target, position, speed):
    # Sort by position descending
    cars = sorted(zip(position, speed), reverse=True)
    stack = []  # arrival times
    
    for pos, spd in cars:
        time = (target - pos) / spd
        # New fleet if slower than the one ahead
        if not stack or time > stack[-1]:
            stack.append(time)
    
    return len(stack)

*/
