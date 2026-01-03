/**
 * K-Means Clustering Algorithm
 * Groups data points into clusters based on similarity
 *
 * Usage:
 *   const kmeans = new KMeansClustering(3);  // Create 3 groups
 *   const groups = kmeans.cluster(data);     // Group the data
 *   const myGroup = kmeans.findGroup(point); // Find which group a point belongs to
 */

class KMeansClustering {
  constructor(k = 3) {
    this.k = k; // Number of groups to create
    this.centroids = []; // Center points of each group
  }

  /**
   * Calculate distance between two data points
   * Uses Euclidean distance formula: √((x1-x2)² + (y1-y2)² + ...)
   */
  calculateDistance(point1, point2) {
    let sum = 0;
    for (let i = 0; i < point1.length; i++) {
      sum += Math.pow(point1[i] - point2[i], 2);
    }
    return Math.sqrt(sum);
  }

  /**
   * Initialize centroids by randomly selecting data points
   */
  initializeCentroids(data) {
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    this.centroids = shuffled.slice(0, this.k);
  }

  /**
   * Assign each data point to the nearest centroid
   * Returns array of group assignments (e.g., [0, 1, 0, 2, 1, ...])
   */
  assignToGroups(data) {
    return data.map((point) => {
      const distances = this.centroids.map((center) =>
        this.calculateDistance(point, center)
      );
      return distances.indexOf(Math.min(...distances));
    });
  }

  /**
   * Update centroid positions based on the mean of their members
   */
  updateCentroids(data, groups) {
    for (let i = 0; i < this.k; i++) {
      const membersInGroup = data.filter((_, idx) => groups[idx] === i);

      if (membersInGroup.length > 0) {
        const newCenter = [];
        for (let d = 0; d < data[0].length; d++) {
          const avg =
            membersInGroup.reduce((sum, point) => sum + point[d], 0) /
            membersInGroup.length;
          newCenter.push(avg);
        }
        this.centroids[i] = newCenter;
      }
    }
  }

  /**
   * Main clustering method
   * Groups data into k clusters and returns group assignments
   *
   * @param {Array} data - Array of data points (each point is an array of numbers)
   * @returns {Array} - Array of group numbers (0 to k-1)
   */
  cluster(data) {
    if (data.length === 0) {
      return [];
    }

    // Adjust k if we have fewer data points than clusters
    if (data.length < this.k) {
      this.k = Math.max(1, data.length);
    }

    this.initializeCentroids(data);

    // Iterate 10 times to find stable groups
    for (let i = 0; i < 10; i++) {
      const groups = this.assignToGroups(data);
      this.updateCentroids(data, groups);
    }

    return this.assignToGroups(data);
  }

  /**
   * Find which group a new data point belongs to
   * Must call cluster() first to initialize centroids
   *
   * @param {Array} point - Single data point (array of numbers)
   * @returns {number} - Group number (0 to k-1)
   */
  findGroup(point) {
    if (this.centroids.length === 0) {
      throw new Error("Must call cluster() before findGroup()");
    }

    const distances = this.centroids.map((center) =>
      this.calculateDistance(point, center)
    );
    return distances.indexOf(Math.min(...distances));
  }
}

module.exports = KMeansClustering;
