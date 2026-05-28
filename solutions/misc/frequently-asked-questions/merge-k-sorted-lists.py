"""
Merge K Sorted Lists (LC 23) — Hard
Pattern: Min-Heap

Time:  O(N log K)
Space: O(K)
"""

import heapq
from typing import List, Optional


class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


def merge_k_lists(lists: List[Optional[ListNode]]) -> Optional[ListNode]:
    heap = []
    # Push the head of each non-empty list into the min-heap
    # Use index as tiebreaker to avoid comparing ListNode objects (not comparable in Python)
    for i, node in enumerate(lists):
        if node:
            heapq.heappush(heap, (node.val, i, node))

    # Dummy node simplifies building the result list
    dummy = ListNode(0)
    cur = dummy

    # Repeatedly extract the minimum node from heap and append to result
    while heap:
        val, i, node = heapq.heappop(heap)
        cur.next = node
        cur = cur.next
        # If the extracted node has a next node, push it into the heap
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))

    return dummy.next


# ── Helpers ───────────────────────────────────────────────────────────────────
def array_to_list(arr):
    dummy = ListNode(0)
    cur = dummy
    for v in arr:
        cur.next = ListNode(v)
        cur = cur.next
    return dummy.next

def list_to_array(head):
    result = []
    while head:
        result.append(head.val)
        head = head.next
    return result


# ── Tests ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    lists = [
        array_to_list([1, 4, 5]),
        array_to_list([1, 3, 4]),
        array_to_list([2, 6]),
    ]
    print(list_to_array(merge_k_lists(lists)))  # [1,1,2,3,4,4,5,6]
