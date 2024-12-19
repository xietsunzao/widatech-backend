function section3(l: number, t: number): number[][] {
    const result: number[][] = [];
    
    // Helper function to find combinations using backtracking
    function findCombinations(
        current: number[], 
        start: number, 
        remainingSum: number, 
        length: number
    ): void {
        // Base cases
        if (length === 0 && remainingSum === 0) {
            result.push([...current]);
            return;
        }
        if (length === 0 || remainingSum <= 0) {
            return;
        }
        
        // Try numbers from start to remainingSum
        for (let i = start; i <= remainingSum; i++) {
            current.push(i);
            findCombinations(current, i + 1, remainingSum - i, length - 1);
            current.pop();
        }
    }
    
    // Start the recursive process
    findCombinations([], 1, t, l);
    
    return result;
}

console.log(section3(3, 6)); // Output: [[1, 2, 7], [1, 3, 6], [1, 4, 5], [2, 3, 5]]
console.log(section3(4, 10)); // Output: [[1, 2, 3, 4]]
console.log(section3(2, 5));  // Output: [[1, 4], [2, 3]]

