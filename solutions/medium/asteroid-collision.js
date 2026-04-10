/**
 * Problem: Asteroid Collision
 * Link: https://leetcode.com/problems/asteroid-collision/
 * Difficulty: Medium
 *
 * Positive = moving right, negative = moving left. Same speed.
 * When two collide, smaller one explodes. If equal, both explode.
 *
 * Example: asteroids = [5,10,-5] => [5,10]
 *
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */

// JavaScript Solution - Stack
function asteroidCollision(asteroids) {
  const stack = [];

  for (const ast of asteroids) {
    let alive = true;

    // Collision: current going left AND top of stack going right
    while (alive && ast < 0 && stack.length && stack[stack.length - 1] > 0) {
      const top = stack[stack.length - 1];

      if (top < -ast) {
        stack.pop(); // stack top destroyed, keep checking
      } else if (top === -ast) {
        stack.pop(); // both destroyed
        alive = false;
      } else {
        alive = false; // current asteroid destroyed
      }
    }

    if (alive) stack.push(ast);
  }

  return stack;
}

module.exports = asteroidCollision;

/* Python Solution:

def asteroidCollision(asteroids):
    stack = []
    
    for ast in asteroids:
        alive = True
        while alive and ast < 0 and stack and stack[-1] > 0:
            if stack[-1] < -ast:
                stack.pop()       # top explodes
            elif stack[-1] == -ast:
                stack.pop()       # both explode
                alive = False
            else:
                alive = False     # current explodes
        
        if alive:
            stack.append(ast)
    
    return stack

*/
