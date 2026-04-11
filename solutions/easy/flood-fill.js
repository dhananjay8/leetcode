/**
 * Problem: Flood Fill
 * Link: https://leetcode.com/problems/flood-fill/
 * Difficulty: Easy
 *
 * Perform a flood fill starting from pixel (sr, sc) with newColor.
 *
 * Example: image = [[1,1,1],[1,1,0],[1,0,1]], sr=1, sc=1, color=2 => [[2,2,2],[2,2,0],[2,0,1]]
 *
 * Time Complexity: O(m * n)
 * Space Complexity: O(m * n) recursion stack
 */

// JavaScript Solution - DFS
function floodFill(image, sr, sc, color) {
  const original = image[sr][sc];
  if (original === color) return image; // no change needed

  function dfs(r, c) {
    if (r < 0 || r >= image.length || c < 0 || c >= image[0].length) return;
    if (image[r][c] !== original) return; // not same color as starting pixel

    image[r][c] = color; // fill with new color
    dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);
  }

  dfs(sr, sc);
  return image;
}

module.exports = floodFill;

/* Python Solution:

def floodFill(image, sr, sc, color):
    original = image[sr][sc]
    if original == color: return image
    
    def dfs(r, c):
        if r < 0 or r >= len(image) or c < 0 or c >= len(image[0]): return
        if image[r][c] != original: return
        image[r][c] = color
        dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1)
    
    dfs(sr, sc)
    return image

*/
