import * as d3 from "d3";
import React from 'react';
import 'typeface-roboto';

import './App.scss';
import DropFiles from "./DropFiles";
import Elbow from "./Elbow";
import Umap from "./Umap";
import {distance} from "./utils";


// TODO: use an alternative id method than HTML id
class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            colorScale: d3.scaleOrdinal(d3.schemeCategory10),
            centroids: undefined,
            clusters: undefined,
            currentRun: -1,
            dataset: undefined,
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
        const margin = {x: 50, y: 50, intra: 50},
          commonHeight = (height- 2*margin.y - margin.intra) / 2,
          firstRowWidth = (width - 2*margin.x - 2*margin.intra) / 3,
          umapMargin = {x: margin.x + 2*firstRowWidth + 2*margin.intra, y: margin.intra};

        return (
          <svg id="baseSvg" height={height} width={width}>
              <Elbow height={commonHeight} width={firstRowWidth} margin={margin}
                     centroids={this.state.centroids} clusters={this.state.clusters}
                     dataset={this.state.dataset}
                     onRunChange={this.updateFromElbow()}/>

              <Umap height={commonHeight} margin={umapMargin} width={firstRowWidth}
                    clusters={this.state.clusters[this.state.currentRun]} dataset={this.state.dataset}
                    colorScale={this.state.colorScale} distance={distance}
                    minDist={this.state.umap.minDist} nNeighbors={this.state.umap.nNeighbors}/>
          </svg>
        )
    }

    getDataset() {
        const component = this;
        return function(config, centroids, clusters, dataset) {
            component.setState({
                centroids: centroids,
                clusters: clusters,
                dataset: dataset,
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
}


export default App;
