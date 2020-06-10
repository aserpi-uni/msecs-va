import * as d3 from "d3";
import {Grid} from '@material-ui/core'
import React from 'react';
import 'typeface-roboto';

import './App.scss';
import DropFiles from "./DropFiles";
import Elbow from "./Elbow";
import Umap from "./Umap";
import ParallelCoordinates from "./ParallelCoordinates"
import Silhouette from "./Silhouette"
import {distance} from "./utils";


// TODO: use an alternative id method than HTML id
class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            busy: 0,
            colorScale: d3.scaleOrdinal(d3.schemeCategory10),
            centroids: undefined,
            currentRun: -1,
            dataset: undefined,
            labels: undefined,
            permanentSelection: new Set([]),
            temporarySelection: undefined,
            umap: undefined
        }
    }

    render() {
        const h = document.documentElement.clientHeight,
          w = document.documentElement.clientWidth;

        if(this.state.dataset) return this.renderApp(w, h);
        return <DropFiles height={h} width={w} callback={this.getDataset()}/>
    }

    renderApp(width, height) {
        const padding = {x: 56, y: 56},
          componentHeight = (height - 4*padding.y) / 2,
          baseComponentWidth = (width - 4*padding.x) / 3;  // TODO

        return (
          <Grid container id="base" style={{height, width}}>
              <Grid container item style={{height, width: baseComponentWidth + 2*padding.x}}>
                  <Grid item xs={12}>
                      <Elbow height={componentHeight} padding={padding} width={baseComponentWidth}
                             centroids={this.state.centroids} dataset={this.state.dataset}
                             labels={this.state.labels}
                             busy={this.state.busy} onRunChange={this.updateFromElbow()}/>
                  </Grid>

                  <Grid item xs={12}>
                      <Umap height={componentHeight} padding={padding} width={baseComponentWidth}
                            dataset={this.state.dataset} labels={this.state.labels[this.state.currentRun]}
                            colorScale={this.state.colorScale} distance={distance}
                            minDist={this.state.umap.minDist} nNeighbors={this.state.umap.nNeighbors}
                            setBusy={this.setBusy()}
                            permanentSelection={this.state.permanentSelection}
                            updatePermanentSelection={this.updatePermanentSelection()}
                            temporarySelection={this.state.temporarySelection}
                            updateTemporarySelection={this.updateTemporarySelection()}/>
                  </Grid>
              </Grid>

              <Grid container item style={{height, width: baseComponentWidth + 2*padding.x}}>
                  <Grid item xs={12}>
                      <ParallelCoordinates height={componentHeight} padding={padding} width={baseComponentWidth * 2}
                                           dataset={this.state.dataset}
                                           labels={this.state.labels[this.state.currentRun]}
                                           colorScale={this.state.colorScale}
                                           permanentSelection={this.state.permanentSelection}
                                           updatePermanentSelection={this.updatePermanentSelection()}
                                           temporarySelection={this.state.temporarySelection}
                                           updateTemporarySelection={this.updateTemporarySelection()}/>
                  </Grid>

                  <Grid item xs={12}>
                      <Silhouette height={componentHeight} padding={padding} width={baseComponentWidth * 2}
                                  dataset={this.state.dataset}
                                  currentRun = {this.state.currentRun}
                                  centroids={this.state.centroids}
                                  labels = {this.state.labels}
                                  currentLabels={this.state.labels[this.state.currentRun]}
                                  colorScale={this.state.colorScale}
                                  permanentSelection={this.state.permanentSelection}
                                  updatePermanentSelection={this.updatePermanentSelection()}
                                  temporarySelection={this.state.temporarySelection}
                                  updateTemporarySelection={this.updateTemporarySelection()}/>
                  </Grid>
              </Grid>
          </Grid>
        )
    }

    setBusy() {
        const component = this;
        return function(busy) {
            component.setState(prevState => ({busy: prevState.busy + (busy ? 1 : -1)}));
        }
    }

    getDataset() {
        const component = this;
        return function(config,  dataset, centroids, labels) {
            component.setState({
                centroids: centroids,
                dataset: dataset,
                labels: labels,
                umap: {
                    minDist: (config.umap && config.umap.minDist),
                    nNeighbors: (config.umap && config.umap.nNeighbors)
                }
            })
        }
    }

    updateFromElbow() {
        const component = this;
        return new_k => component.setState({currentRun: new_k})
    }

    updatePermanentSelection() {
        const component = this;
        // Accepts both arrays and sets for adding and toggling,
        // only sets for deleting and setting.
        return function(operation, indices) {
            if(operation === "add") {
                component.setState(function(prevState) {
                    return {
                        permanentSelection: new Set([...prevState.permanentSelection, ...indices])
                    }
                })
            } else if (operation === "delete") {
                component.setState(function(prevState) {
                    return {
                        permanentSelection: new Set([...prevState.permanentSelection].filter(i => ! indices.has(i)))
                    }
                })
            } else if(operation === "set") {
                component.setState({permanentSelection: indices})
            } else if(operation === "toggle") {
                component.setState(function(prevState) {
                    const newIndices = [];
                    for(const i of indices) {
                        if(! prevState.permanentSelection.delete(i)) newIndices.push(i)
                    }

                    return {
                        permanentSelection: new Set([...newIndices, ...prevState.permanentSelection])
                    }
                });
            }
        }
    }

    updateTemporarySelection() {
        const component = this;
        return selectedIndex => component.setState({temporarySelection: selectedIndex})
    }
}


export default App;
