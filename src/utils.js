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

let betweenDistances = undefined,
  classifiedDataset = undefined,
  withinSquaredDistances = undefined;


function computeBetweenDistances(dataset) {
    betweenDistances = {};

    Object.keys(classifiedDataset).forEach(function (run) {
        betweenDistances[run] = {};

        Object.keys(classifiedDataset[run]).forEach(function (i) {
            betweenDistances[run][i] = 0;

            classifiedDataset[run][i].forEach(function (j) {
                dataset.forEach(function (l) {
                    betweenDistances[run][i] += distance(j, l);
                })
            })

            betweenDistances[run][i] = betweenDistances[run][i]**2;
        })
    })
}

function computeClassifiedDataset(dataset, labels) {
    classifiedDataset = {};

    Object.keys(labels).forEach(function (run) {
        classifiedDataset[run] = {};

        for(let i = 0; i < dataset.length; i++) {
            const c = labels[run][i];

            if(classifiedDataset[run][c] === undefined) {
                classifiedDataset[run][c] = [];
            }

            classifiedDataset[run][c].push(dataset[i])
        }
    });
}


function computeFScore(n) {
    const fScore = {};

    Object.keys(betweenDistances).forEach(function (run) {
        fScore[run] = 0;

        const clusters = parseInt(run),
            coef = (n - clusters) / ((clusters - 1) * (n**2));

        Object.keys(betweenDistances[run]).forEach(function (i) {
            fScore[run] += classifiedDataset[run][i].length * (betweenDistances[run][i]**2) / withinSquaredDistances[run][i];
        })

        fScore[run] = coef * fScore[run];
    })

    return fScore;
}


function computeSse() {
    const sse = {};
    Object.keys(withinSquaredDistances).forEach(function (run) {
        sse[run] = 0;

        Object.keys(withinSquaredDistances[run]).forEach(function (i) {
            sse[run] += withinSquaredDistances[run][i] / (classifiedDataset[run][i].length **2);
        })
    })

    return sse;
}


function computeWithinSquaredDistances() {
    withinSquaredDistances = {};

    Object.keys(classifiedDataset).forEach(function (run) {
        withinSquaredDistances[run] = {};

        Object.keys(classifiedDataset[run]).forEach(function (i) {
            classifiedDataset[run][i].forEach(function (j) {
                let pointDist = 0

                classifiedDataset[run][i].forEach(function (l) {
                    pointDist += distance(j, l);
                })

                withinSquaredDistances[run][i] = (withinSquaredDistances[run][i] || 0) + pointDist**2;
            })
        })
    })
}


function initElbow(dataset, labels) {
    computeClassifiedDataset(dataset, labels);
    computeBetweenDistances(dataset);
    computeWithinSquaredDistances();
    return [computeSse(), computeFScore(dataset.length)];
}


// Silhouette-method objects

function computeSilhouetteValue(dataset, centroids, dimensionMatrix, index, indexLabel, labels){
    const currentLabel = labels[index];
    const currentIndex = index;
    const elements = labels.length;
    let C_i = 0;
    let C_k = {};
    let sum_a_i = 0;
    let sum_b_i = {};
    let b_i = 1;
    let a_i, b_i_set = {};
    for(let i in elements){
        if(labels[i] === currentLabel){
            C_i += 1;
            sum_a_i += distance(dataset[currentIndex], dataset[i]);
        }
        else {
            C_k[labels[i].toString()] += 1;
            sum_b_i[i.toString()] += distance(dataset[currentIndex], dataset[i]);
        }
    }
    if(C_i > 1){return 0}
    else {
        a_i = sum_a_i / (C_i - 1);
        for (let key in C_k) {
            b_i_set[key.toString()] = sum_b_i[key] / (C_k[key]);
            if (b_i_set[key] < b_i) {
                b_i = b_i_set[key];
            }
        }
        let s_i = (b_i - a_i) / (d3.max([a_i, b_i]));
        return s_i;
    }
}


export { computeSilhouetteValue, distance, init, initElbow, parseDatasetElement, categoricalFeatures, numericalFeatures }
