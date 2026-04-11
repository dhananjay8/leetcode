/**
 * Problem: Minimum Genetic Mutation
 * Link: https://leetcode.com/problems/minimum-genetic-mutation/
 * Difficulty: Medium
 *
 * Gene string is 8 chars of 'A','C','G','T'. Find min mutations from startGene to endGene.
 * Each mutation changes one char and must be in the gene bank.
 *
 * Time Complexity: O(n * 8 * 4)
 * Space Complexity: O(n)
 */

// JavaScript Solution — BFS (same as Word Ladder)
function minMutation(startGene, endGene, bank) {
  const bankSet = new Set(bank);
  if (!bankSet.has(endGene)) return -1;

  const queue = [[startGene, 0]];
  const visited = new Set([startGene]);

  while (queue.length) {
    const [gene, steps] = queue.shift();
    for (let i = 0; i < 8; i++) {
      for (const ch of 'ACGT') {
        const mutated = gene.slice(0, i) + ch + gene.slice(i + 1);
        if (mutated === endGene) return steps + 1;
        if (bankSet.has(mutated) && !visited.has(mutated)) {
          visited.add(mutated);
          queue.push([mutated, steps + 1]);
        }
      }
    }
  }

  return -1;
}

module.exports = minMutation;

/* Python Solution:

from collections import deque

def minMutation(startGene, endGene, bank):
    bank_set = set(bank)
    if endGene not in bank_set: return -1
    
    queue = deque([(startGene, 0)])
    visited = {startGene}
    
    while queue:
        gene, steps = queue.popleft()
        for i in range(8):
            for ch in 'ACGT':
                mutated = gene[:i] + ch + gene[i+1:]
                if mutated == endGene: return steps + 1
                if mutated in bank_set and mutated not in visited:
                    visited.add(mutated)
                    queue.append((mutated, steps + 1))
    return -1

*/
