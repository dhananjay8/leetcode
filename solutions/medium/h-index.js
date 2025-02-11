var hIndex = function (citations) {
  citations.sort((a, b) => b - a); // Sort in descending order
  let h = 0;

  for (let i = 0; i < citations.length; i++) {
    if (citations[i] >= i + 1) {
      h = i + 1; // Update h-index
    } else {
      break; // Stop if condition is not met
    }
  }

  return h;
};
