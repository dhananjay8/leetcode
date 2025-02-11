/**
 * @param {number[]} gas
 * @param {number[]} cost
 * @return {number}
 */
var canCompleteCircuit = function (gas, cost) {
  let totalTank = 0; // Keeps track of the total balance of gas in the entire circuit
  let currTank = 0; // Keeps track of the gas balance while traversing the circuit
  let startIndex = 0; // Stores the potential starting index

  for (let i = 0; i < gas.length; i++) {
    let balance = gas[i] - cost[i]; // Net gas after reaching the next station
    totalTank += balance; // Accumulate total gas balance
    currTank += balance; // Update the current tank balance

    // If current tank becomes negative, reset starting index to i + 1
    if (currTank < 0) {
      startIndex = i + 1; // Move start to the next station
      currTank = 0; // Reset current tank as we are starting fresh
    }
  }

  // If total gas available is negative, it's impossible to complete the circuit
  return totalTank >= 0 ? startIndex : -1;
};
