class Solution:
    def maxPoints(self, points: List[List[int]]) -> int:
        if len(points) < 3: return len(points)
        maxCount = 1
        for i, point1 in enumerate(points):
            slopes = defaultdict(int)
            for j, point2 in enumerate(points[i+1:]):
                slope = self.calcSlope(point1, point2)
                slopes[slope] += 1
                maxCount = max(maxCount, slopes[slope])
            print(slopes)
        return maxCount+1

    def calcSlope(self, point1, point2):
        x1, y1 = point1
        x2, y2 = point2
        if x1-x2 == 0:
            return 
        return (y1-y2)/(x1-x2) # Slope of a line