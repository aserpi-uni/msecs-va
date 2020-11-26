# UVAP - Untitled Visual Analytics Project
UVAP (short for Untitled Visual Analytics Projects)  was developed as final project for the Visual Analytics course teached at [Sapienza University of Rome](https://www.uniroma1.it/en).
It is meant to  help data analysts choose the optimal *k* for *k*-prototypes.

Users run *k*-prototypes several times with different values of *k*.
Then, use UVAP to choose a 

## Server
The server behaves exactly as a React app, so `npm start` launches the app in development mode.
Simply open [http://localhost:3000/](http://localhost:3000/) to view it in the browser.

Datasets are passed directly through the browser as a folder or collection of files.
A dataset is composed by:
 - `dataset.csv`: CSV file with the actual dataset, must have a header
 - `dataset.json`: JSON file with the hyper-parameters (see below)
 - `centroids_x.csv`: CSV files (with header) containing the centroids outputted by *k*-prototypes when *k* = `x`
 - `labels_x.csv`: list of labels outputted by *k*-prototypes when *k* = `x`
 
### `dataset.json`
Example of a `dataset.json` file.
The `umap` key can be omitted, it overrides the default values for UAMP.
```
{
    "gamma": 1.9130857071,
    "categoricalFeatures": ["f0", "f1", "f3", "f7"],
    "numericalFeatures": ["f2", "f4", "f5", "f6"],
    "umap": {
        "minDist": 0.1,
        "nNeighbors": 10
    }
}
```


## Charts
UVAP is composed by four charts:
 - top left: elbow method
 - top right: ParCoords
 - bottom left: UMAP
 - bottom right: silhouette
In order to change the settings for a given chart, click on the adjacent gear symbol.
 
### Elbow method
The elbow method is a heuristic used in determining the number of clusters in a data set.
There are several metrics that can be used in an elbow chart.
However, they all work exclusively with numerical elements.
Thus, we chose the two most widely used and extended to mixed datasets.

### ParCoords
ParCoords (parallel coordinates) are a common way of visualising and analysing high-dimensional data.
Each axis represent a feature.
Samples are drawn as lines connecting the axes.

The chart supports selection across multiple axes.

### UMAP
UMAP (Uniform Manifold Approximation and Projection) is a non-linear dimensionality reduction algorithms that does not rely on a specific metric.
Thus, we used distance function defined by the *k*-prototypes algorithm.

Clicking on a single point replaces the current selection with the one point.
If also `shift` is pressed, the point is added to the selection.
Brushing with `shift` adds points to, whereas with `ctr` removes them from, the selection.

### Silhouette
Silhouette provides a rough estimation of how well elements have been classified.
A numerical value in \[-1, 1\] is associated to each element.
The higher it is, the better the centroid represent the element.
Values lower than 0 mean that the second-nearest centroid is actually a better fit.

### Interaction
The elbow chart has a master/slave relationship with the other tree.
Clicking on a run automatically updates ParCoords, UMAP and silhouette.

Conversely, the other charts are at the same level.
A selection change is immediately propagated among all three charts.
