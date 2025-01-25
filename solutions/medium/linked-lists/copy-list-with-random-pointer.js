/**
 * Definition for a Node.
 * function Node(val, next, random) {
 *     this.val = val;
 *     this.next = next;
 *     this.random = random;
 * }
 */

/**
 * @param {Node} head
 * @return {Node}
 */
var copyRandomList = function (head) {
  if (!head) return null;

  // Step 1: Create a copy of each node and link them next to the original node
  let current = head;
  while (current) {
    const newNode = new Node(current.val, current.next, null);
    current.next = newNode;
    current = newNode.next;
  }

  // Step 2: Set the random pointers of the newly created nodes
  current = head;
  while (current) {
    if (current.random) {
      current.next.random = current.random.next;
    }
    current = current.next.next;
  }

  // Step 3: Separate the original list and the copied list
  current = head;
  const newHead = head.next;
  while (current) {
    const copy = current.next;
    current.next = copy.next;
    current = current.next;
    if (current) {
      copy.next = current.next;
    }
  }

  return newHead;
};
