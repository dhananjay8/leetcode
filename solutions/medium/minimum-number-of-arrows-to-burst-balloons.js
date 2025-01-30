/**
 * @param {number[][]} points
 * @return {number}
 */
var findMinArrowShots = function (points) {
  if (points.length === 0) return 0;
  points.sort((a, b) => a[1] - b[1]); // Sort by the ending x-coordinates

  // console.log('points--', points);

  let arrows = 1;
  let end = points[0][1]; // end of the first balloon i.e. last burst point

  for (let i = 1; i < points.length; i++) {
    if (points[i][0] > end) {
      // If the balloon starts after the last burst point
      arrows++;
      end = points[i][1]; // Update the burst range
    }
  }

  return arrows;
};
