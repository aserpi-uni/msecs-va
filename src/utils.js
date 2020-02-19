import * as d3 from 'd3'


// General objects

let categoricalFeatures, numericalFeatures, gamma;


// A weighted Heterogeneous Euclidean-Overlap Metric (HEOM)
// Gamma must be the same as in the k-prototypes runs.
function distance(d1, d2) {
    let totalDistance = 0;
    categoricalFeatures.forEach(f => totalDistance += d1[f] === d2[f] ? 0 : gamma);
    numericalFeatures.forEach(f => totalDistance += (d1[f] - d2[f])**2);

    return Math.sqrt(totalDistance)
}


function init(catFeatures, numFeatures, g) {
    categoricalFeatures = catFeatures;
    numericalFeatures = numFeatures;
    gamma = g;
}


function parseDatasetElement(d) {
    const newD = {};
    categoricalFeatures.forEach(f => newD[f] = d[f]);
    numericalFeatures.forEach(f => newD[f] = +d[f]);

    return newD;
}


// Elbow-method objects

let commonElbowDenominator = undefined;


function computeCommonElbowDenominator(dataset) {
    let totalDistance = 0;
    for(let i = 0; i < dataset.length; i++) {
        for(let j = i + 1; j < dataset.length; j++) {
            totalDistance += distance(dataset[i], dataset[j])**2
        }
    }

    commonElbowDenominator = totalDistance * dataset.length;
}


function computeSse(dataset, labels, centroids) {
    const sse = {};
    for(let i = 0; i < dataset.length; i++) {
        const c = labels[i];
        sse[c] = (sse[c] || 0) + distance(dataset[i], centroids[c])**2
    }

    return d3.sum(Object.keys(sse), k => sse[k])
}


function computeWeightedSquareOfDistance(dataset, labels, k) {
    const se = {},
      clusterLength = {};
    for(let i = 0; i < dataset.length; i++) {
        const c = labels[i],
          d = dataset[i];
        clusterLength[c] = (clusterLength[c] || 0) + 1;
        se[c] = (se[c] || 0) + d3.sum(dataset, d2 => distance(d, d2))
    }

    return d3.sum(Object.keys(se), c => se[c]**2 / clusterLength[c]) / (k - 1)
}


function computeVariance(dataset, labels, k) {
    if(! commonElbowDenominator) computeCommonElbowDenominator(dataset);
    return computeWeightedSquareOfDistance(dataset, labels, k) / commonElbowDenominator
}


export { computeSse, computeVariance, distance, init, parseDatasetElement }
