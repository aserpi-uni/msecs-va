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

// Silhouette-method objects

function computeSilhouetteValue(dataset, centroids, dimensionMatrix, index, indexLabel, labels){
    const currentLabel = labels[index];
    const currentIndex = index;
    const elements = labels.length;
    let C_i = 0;
    let C_k = {};
    let sum_ai = 0;
    let sum_bi = {};
    let b_i = 1;
    let a_i, b_i_set = {};
    for(let i in elements){
        if(labels[i] === currentLabel){
            C_i += 1;
            sum_ai += distance(dataset[currentIndex], dataset[i]);
        }
        else {
            C_k[labels[i]] += 1;
            sum_bi[i] += distance(dataset[currentIndex], dataset[i]);
        }
    }
    if(C_i > 1){return 0}
    else {
        a_i = sum_ai / (C_i - 1);
        for (let key in C_k) {
            b_i_set[key] = sum_bi[key] / (C_k[key]);
            if (b_i_set[key] < b_i) {
                b_i = b_i_set[key];
            }
        }
        let s_i = (b_i - a_i) / (d3.max([a_i, b_i]));
        return s_i;
    }
}


export { computeSse, computeVariance, distance, init, parseDatasetElement, categoricalFeatures, numericalFeatures, computeSilhouetteValue }
