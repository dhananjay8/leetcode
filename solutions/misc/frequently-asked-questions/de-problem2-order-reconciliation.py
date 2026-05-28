"""
Problem 2 (DE Round - Medium, ~18 min)
"Two large lists of order IDs from two systems. Find orders missing in one,
 duplicates in the other. Optimise for memory."

Pattern: HashMap + Set Operations + Space-Time Trade-off
Time:  O(n + m)
Space: O(min(n, m)) — build set from smaller list

60-Second Identification:
  Core DS: two lists → Counter (freq map) + set membership
  Core Op: detect missing, detect duplicates
  Constraint: large data → memory optimised
  → Counter for duplicates; Set intersection/difference for missing
"""

from collections import Counter
from typing import List, Dict, Tuple, Generator


def reconcile_orders(
    list_a: List[str],
    list_b: List[str]
) -> Dict:
    """
    Full in-memory reconciliation.

    Returns:
        missing_in_b:    orders in A but NOT in B
        missing_in_a:    orders in B but NOT in A
        duplicates_in_a: {orderId: count} for orders appearing >1 in A
        duplicates_in_b: {orderId: count} for orders appearing >1 in B
    """
    # Build frequency maps for both lists to detect duplicates
    freq_a = Counter(list_a)
    freq_b = Counter(list_b)

    # Convert to sets for fast membership tests (find missing orders)
    set_a = set(freq_a.keys())
    set_b = set(freq_b.keys())

    # Set difference gives orders present in one but not the other
    missing_in_b = sorted(set_a - set_b)  # in A, not in B
    missing_in_a = sorted(set_b - set_a)  # in B, not in A

    # Filter frequency maps to keep only entries with count > 1 (duplicates)
    duplicates_in_a = {k: v for k, v in freq_a.items() if v > 1}
    duplicates_in_b = {k: v for k, v in freq_b.items() if v > 1}

    return {
        "missing_in_b": missing_in_b,
        "missing_in_a": missing_in_a,
        "duplicates_in_a": duplicates_in_a,
        "duplicates_in_b": duplicates_in_b,
    }


def reconcile_stream(
    smaller_list: List[str],
    stream_b: Generator[str, None, None]
) -> Dict:
    """
    Memory-optimised variant: smaller_list fits in RAM, stream_b is a
    generator (e.g., file line-by-line). Never materialise full stream_b.

    Space: O(|smaller_list|) for set_a + O(unique IDs in B seen so far)
    """
    # Build frequency map and set from the smaller list (fits in memory)
    freq_a = Counter(smaller_list)
    set_a = set(freq_a.keys())

    # Process stream_b incrementally without loading it entirely
    freq_b: Counter = Counter()
    seen_in_b: set = set()  # Track IDs already added to missing_in_a to avoid duplicates
    missing_in_a = []

    for order_id in stream_b:
        freq_b[order_id] += 1
        # If order_id not in A and not already recorded as missing, add it
        if order_id not in set_a and order_id not in seen_in_b:
            missing_in_a.append(order_id)
            seen_in_b.add(order_id)

    # After stream is processed, find orders in A that were never seen in B
    missing_in_b = sorted(set_a - set(freq_b.keys()))

    # Extract duplicates from both frequency maps
    duplicates_in_a = {k: v for k, v in freq_a.items() if v > 1}
    duplicates_in_b = {k: v for k, v in freq_b.items() if v > 1}

    return {
        "missing_in_b": missing_in_b,
        "missing_in_a": missing_in_a,
        "duplicates_in_a": duplicates_in_a,
        "duplicates_in_b": duplicates_in_b,
    }


# ── Tests ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    system_a = ["ord1", "ord2", "ord3", "ord2", "ord4", "ord5"]
    system_b = ["ord1", "ord3", "ord3", "ord5", "ord6", "ord7"]

    result = reconcile_orders(system_a, system_b)
    print("Missing in B:", result["missing_in_b"])         # ["ord2","ord4"]
    print("Missing in A:", result["missing_in_a"])         # ["ord6","ord7"]
    print("Duplicates in A:", result["duplicates_in_a"])   # {"ord2": 2}
    print("Duplicates in B:", result["duplicates_in_b"])   # {"ord3": 2}

    # Stream variant
    def b_stream():
        for x in system_b:
            yield x

    result2 = reconcile_stream(system_a, b_stream())
    print("\nStream result:", result2)
