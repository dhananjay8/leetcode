"""
Word Ladder (LC 127) — Hard
Pattern: BFS on implicit graph

Time:  O(M² × N) where M = word length, N = wordList size
Space: O(M² × N)
"""

from collections import defaultdict, deque
from typing import List


def ladder_length(begin_word: str, end_word: str, word_list: List[str]) -> int:
    # Convert word_list to set for O(1) lookup
    word_set = set(word_list)
    # If end_word not in word_list, transformation is impossible
    if end_word not in word_set:
        return 0

    L = len(begin_word)

    # Preprocessing: build adjacency map using wildcard patterns
    # For each word, generate patterns like "h*t" and map to all words matching that pattern
    # This allows O(1) neighbor lookup during BFS instead of O(N) per word
    pattern_map: defaultdict = defaultdict(list)
    for word in [begin_word] + word_list:
        for i in range(L):
            pattern = word[:i] + "*" + word[i+1:]
            pattern_map[pattern].append(word)

    # BFS queue stores (current_word, number_of_steps_to_reach_it)
    queue = deque([(begin_word, 1)])
    visited = {begin_word}  # Track visited words to avoid cycles

    while queue:
        word, steps = queue.popleft()
        # Generate all possible patterns for current word
        for i in range(L):
            pattern = word[:i] + "*" + word[i+1:]
            # Explore all neighbors (words that differ by exactly 1 character)
            for neighbor in pattern_map[pattern]:
                if neighbor == end_word:
                    return steps + 1  # Found target, return path length
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append((neighbor, steps + 1))

    return 0  # No transformation path exists


# ── Tests ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print(ladder_length("hit", "cog", ["hot","dot","dog","lot","log","cog"]))  # 5
    print(ladder_length("hit", "cog", ["hot","dot","dog","lot","log"]))        # 0
    print(ladder_length("a", "c",    ["a","b","c"]))                           # 2
