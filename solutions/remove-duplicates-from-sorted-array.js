if (nums.length === 0) return 0;

let uniqueIndex = 0; // Points to the position where the next unique element will go

for (let i = 1; i < nums.length; i++) {
  if (nums[i] !== nums[uniqueIndex]) {
    uniqueIndex++; // Move to the next position for a unique element
    nums[uniqueIndex] = nums[i]; // Update with the unique element
  }
}

// Return the count of unique elements
return uniqueIndex + 1;
