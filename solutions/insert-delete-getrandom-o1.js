var RandomizedSet = function (set) {
  this.set = new Set();
  this.arr = [];
};

/**
 * @param {number} val
 * @return {boolean}
 */
RandomizedSet.prototype.insert = function (val) {
  if (this.set.has(val)) return false;
  this.set.add(val);
  this.arr.push(val);
  return true;
};

/**
 * @param {number} val
 * @return {boolean}
 */
RandomizedSet.prototype.remove = function (val) {
  if (!this.set.has(val)) return false; // If the value is not in the set, return false.

  this.set.delete(val); // Remove the value from the set.

  // To maintain an array with continuous elements without leaving gaps, the value at index is replaced with the last element in the array.
  const index = this.arr.indexOf(val); // Find the index of the value in the array.
  this.arr[index] = this.arr[this.arr.length - 1]; // Overwrite the value with the last element in the array.
  this.arr.pop(); // Remove the last element from the array.

  return true; // Indicate that the removal was successful.
};

/**
 * @return {number}
 */
RandomizedSet.prototype.getRandom = function () {
  const randomIndex = Math.floor(Math.random() * this.arr.length);
  return this.arr[randomIndex];
};

/**
 * Your RandomizedSet object will be instantiated and called as such:
 * var obj = new RandomizedSet()
 * var param_1 = obj.insert(val)
 * var param_2 = obj.remove(val)
 * var param_3 = obj.getRandom()
 */
