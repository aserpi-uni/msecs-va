import * as d3 from 'd3'


const categoricalFeatures = ["f0", "f1", "f3", "f7"],
  numericalFeatures = ["f2", "f4", "f5", "f6"],
  gamma = 0.14;

function computeSse(dataset, labels, centroids) {
    const sse = {};
    for(let i = 0; i < dataset.length; i++) {
        const c = labels[i];
        sse[c] = (sse[c] || 0) + distance(dataset[i], centroids[c])**2
    }
    return d3.sum(Object.keys(sse), k => sse[k])
}

// A custom weighted Heterogeneous Euclidean-Overlap Metric (HEOM)
function distance(d1, d2) {
    let totalDistance = 0;
    categoricalFeatures.forEach(f => totalDistance += d1[f] === d2[f] ? 0 : gamma);
    numericalFeatures.forEach(f => totalDistance += (d1[f] - d2[f])**2);

    return Math.sqrt(totalDistance)
}

function parseDatasetElement(d) {
    const newD = {};
    categoricalFeatures.forEach(f => newD[f] = d[f]);
    numericalFeatures.forEach(f => newD[f] = +d[f]);

    return newD;
}


let squaredDistance = undefined;

function computeSquareDistances(dataset) {
    let totalDistance = 0;
    for(let i = 0; i < dataset.length; i++) {
        for(let j = i + 1; j < dataset.length; j++) {
            totalDistance += distance(dataset[i], dataset[j])**2
        }
    }
    squaredDistance = totalDistance;
}

function computeWeightedSquareOfDistance(dataset, labels, k) {
    dataset.forEach((d, i) => d.cluster = labels[i]);
    let totalDistance = 0;

    for(let clusterIndex = 0; clusterIndex < k; clusterIndex ++) {
        const cluster = dataset.filter(d => d.cluster === clusterIndex);
        let clusterDistance = 0;
        cluster.forEach(c => dataset.forEach(d => clusterDistance += distance(c, d)));

        totalDistance += (clusterDistance**2) / cluster.length;
    }

    return totalDistance / (k - 1);
}

function computeVariance(dataset, labels, k) {
    if(! squaredDistance) computeSquareDistances(dataset);
    return computeWeightedSquareOfDistance(dataset, labels, k) / (dataset.length * squaredDistance)
}


export { computeSse, distance, parseDatasetElement,computeVariance }
