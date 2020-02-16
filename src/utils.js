const categoricalFeatures = ["f0", "f1", "f3", "f7"],
  numericalFeatures = ["f2", "f4", "f5", "f6"],
  gamma = 0.14;

// A custom weighted Heterogeneous Euclidean-Overlap Metric (HEOM)
function distance(d1, d2) {
    let totalDistance = 0;
    categoricalFeatures.forEach(f => totalDistance += d1[f] === d2[f] ? 0 : gamma);
    numericalFeatures.forEach(f => totalDistance += (d1[f] - d2[f])**2);

    return Math.sqrt(totalDistance)
}
