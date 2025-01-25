
Sorting Algorithms

Algorithm	Best Time Complexity	Average Time Complexity	Worst Time Complexity	Space Complexity	Stability
Bubble Sort	O(n)	O(n²)	O(n²)	O(1)	Stable
Selection Sort	O(n²)	O(n²)	O(n²)	O(1)	Unstable
Insertion Sort	O(n)	O(n²)	O(n²)	O(1)	Stable
Merge Sort	O(n log n)	O(n log n)	O(n log n)	O(n)	Stable
Quick Sort	O(n log n)	O(n log n)	O(n²)	O(log n)	Unstable
Heap Sort	O(n log n)	O(n log n)	O(n log n)	O(1)	Unstable
Radix Sort	O(nk)	O(nk)	O(nk)	O(n + k)	Stable
Counting Sort	O(n + k)	O(n + k)	O(n + k)	O(k)	Stable
Bucket Sort	O(n + k)	O(n + k)	O(n²)	O(n + k)	Stable

Notes:
	•	n: Number of elements in the input array.
	•	k: Range of the input (maximum value - minimum value).


Searching Algorithms

Algorithm	Best Time Complexity	Average Time Complexity	Worst Time Complexity	Space Complexity
Linear Search	O(1)	O(n)	O(n)	O(1)
Binary Search	O(1)	O(log n)	O(log n)	O(1)
Jump Search	O(√n)	O(√n)	O(√n)	O(1)
Interpolation Search	O(1)	O(log log n)	O(n)	O(1)
Exponential Search	O(1)	O(log n)	O(log n)	O(1)

Notes:
	•	Binary Search works only on sorted arrays.
	•	Interpolation Search is efficient when the elements are uniformly distributed.

Sorting Algorithm Use Cases
	•	Merge Sort: Large datasets, external sorting.
	•	Quick Sort: In-memory sorting, average-case efficient.
	•	Counting/Radix Sort: When range (k) is limited and integer-based.

Searching Algorithm Use Cases
	•	Linear Search: Small or unsorted datasets.
	•	Binary Search: Large sorted datasets.
	•	Exponential Search: Used for unbounded/infinite arrays.
