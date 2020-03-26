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
        // Need 4px of fake padding, otherwise Firefox displays scrollbars
        const h = document.documentElement.clientHeight - 4,
          w = document.documentElement.clientWidth;

        if(this.state.dataset) return this.renderApp(w, h);
        return <DropFiles height={h} width={w} callback={this.getDataset()}/>
    }

    renderApp(width, height) {
        const padding = {x: 50, y: 50},
          commonHeight = (height - 3*padding.y) / 2,
          firstRowWidth = (width - 3*padding.x) / 3;

        return (
          <Grid id="base" style={{height, width}}>
              <div>
              <Elbow height={commonHeight} padding={padding} width={firstRowWidth}
                     centroids={this.state.centroids} dataset={this.state.dataset}
                     labels={this.state.labels}
                     busy={this.state.busy} onRunChange={this.updateFromElbow()}/>

              <Umap height={commonHeight} padding={padding} width={firstRowWidth}
                    dataset={this.state.dataset} labels={this.state.labels[this.state.currentRun]}
                    colorScale={this.state.colorScale} distance={distance}
                    minDist={this.state.umap.minDist} nNeighbors={this.state.umap.nNeighbors}
                    setBusy={this.setBusy()}
                    permanentSelection={this.state.permanentSelection}
                    updatePermanentSelection={this.updatePermanentSelection()}
                    temporarySelection={this.state.temporarySelection}
                    updateTemporarySelection={this.updateTemporarySelection()}/>
                    </div>
              <div>
                  <ParallelCoordinates height={commonHeight} padding={padding} width={(firstRowWidth + padding.x)*2}
                                       dataset={this.state.dataset}
                                       labels={this.state.labels[this.state.currentRun]}
                                       colorScale={this.state.colorScale}
                                       permanentSelection={this.state.permanentSelection}
                                       updatePermanentSelection={this.updatePermanentSelection()}
                                       temporarySelection={this.state.temporarySelection}
                                       updateTemporarySelection={this.updateTemporarySelection()}/>
              </div>
              <div>
                  <Silhouette height={commonHeight} padding={padding} width={(firstRowWidth + padding.x)*2}
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

                    </div>




          </Grid>
        )
    }
    /* <ParallelCoordinates height={commonHeight} padding={padding} width={firstRowWidth}
                   dataset={this.state.dataset}
                   centroids={this.state.centroids}
                   labels={this.state.labels[this.state.currentRun]}
                   colorScale={this.state.colorScale}
                   permanentSelection={this.state.permanentSelection}
                   updatePermanentSelection={this.updatePermanentSelection()}
                   temporarySelection={this.state.temporarySelection}
                   updateTemporarySelection={this.updateTemporarySelection()}/>*/
/*<Silhouette height={commonHeight} padding={padding} width={firstRowWidth}
dataset={this.state.dataset}
centroids={this.state.centroids}
labels={this.state.labels[this.state.currentRun]}
colorScale={this.state.colorScale}
permanentSelection={this.state.permanentSelection}
updatePermanentSelection={this.updatePermanentSelection()}
temporarySelection={this.state.temporarySelection}
updateTemporarySelection={this.updateTemporarySelection()}/>*/


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
