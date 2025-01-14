const quickSort = (arr) => {
  if (arr.length <= 1) return arr; // Base case
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter((x) => x < pivot);
  const right = arr.filter((x) => x > pivot);
  const middle = arr.filter((x) => x === pivot);
  return [...quickSort(left), ...middle, ...quickSort(right)];
};
