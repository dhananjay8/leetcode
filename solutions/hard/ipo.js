/**
 * @param {number} k
 * @param {number} w
 * @param {number[]} profits
 * @param {number[]} capital
 * @return {number}
 */
var findMaximizedCapital = function(k, w, profits, capital) {
    // Create arrays of projects with their capital and profit
    const projects = [];
    for (let i = 0; i < profits.length; i++) {
        projects.push({ capital: capital[i], profit: profits[i] });
    }
    
    // Sort projects by capital required (ascending)
    projects.sort((a, b) => a.capital - b.capital);
    
    // Max heap to store profits of affordable projects
    // Using negative values for max heap simulation with min heap
    const maxHeap = [];
    
    let projectIndex = 0;
    
    // Perform up to k projects
    for (let i = 0; i < k; i++) {
        // Add all affordable projects to the heap
        while (projectIndex < projects.length && projects[projectIndex].capital <= w) {
            // Push negative profit to simulate max heap
            maxHeap.push(-projects[projectIndex].profit);
            projectIndex++;
        }
        
        // If no affordable projects, break
        if (maxHeap.length === 0) break;
        
        // Get the project with maximum profit
        maxHeap.sort((a, b) => a - b); // Sort to get max (most negative)
        const maxProfit = -maxHeap.shift();
        w += maxProfit;
    }
    
    return w;
};

// Test cases
console.log(findMaximizedCapital(2, 0, [1,2,3], [0,1,1])); // 4
console.log(findMaximizedCapital(3, 0, [1,2,3], [0,1,2])); // 6
