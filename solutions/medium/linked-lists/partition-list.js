function partition(head, x) {
  // Create two dummy nodes
  // `beforeHead` will store nodes with values less than x
  let beforeHead = new ListNode(0);
  let before = beforeHead; // Pointer for the 'before' list

  // `afterHead` will store nodes with values greater than or equal to x
  let afterHead = new ListNode(0);
  let after = afterHead; // Pointer for the 'after' list

  // Traverse the original linked list
  while (head) {
    if (head.val < x) {
      // Add the current node to the 'before' list
      before.next = head;
      before = before.next;
    } else {
      // Add the current node to the 'after' list
      after.next = head;
      after = after.next;
    }
    // Move to the next node in the original list
    head = head.next;
  }

  // Terminate the 'after' list to avoid a cycle in case the last node was connected previously
  after.next = null;

  // Connect the 'before' list with the 'after' list
  before.next = afterHead.next;

  // Return the merged list, skipping the dummy head of 'before' list
  return beforeHead.next;
}
