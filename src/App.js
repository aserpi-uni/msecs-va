import * as d3 from "d3";
import React from 'react';

import './App.scss';
import DropFiles from "./DropFiles";
import Elbow from "./Elbow";
import Umap from "./Umap";
import {distance, parseDatasetElement} from "./utils";


// TODO: use an alternative id method than HTML id
class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            colorScale: d3.scaleOrdinal(d3.schemeCategory10),
            centroids: {},
            clusters: {},
            currentRun: -1,
            dataset: undefined,
            umap: {
                nNeighbors: 15,
                minDist: 0.1,
            },
            numRuns: 0
        }
    }

    render() {
        // Need 4px of fake padding, otherwise Firefox displays scrollbars
        const h = document.documentElement.clientHeight - 4,
          w = document.documentElement.clientWidth;

        if(this.state.dataset && this.state.numRuns === 0) return this.renderApp(w, h);
        return (
          <DropFiles height={h} width={w} onDroppedFiles={this.setNumRuns()}
                     runCallback={this.parseRunFile()} datasetCallback={this.parseDatasetFile()}/>)
    }

    renderApp(width, height) {
        const margin = {x: 50, y: 50, intra: 50},
          commonHeight = (height- 2*margin.y - margin.intra) / 2,
          firstRowWidth = (width - 2*margin.x - 2*margin.intra) / 3,
          umapMargin = {x: margin.x + 2*firstRowWidth + 2*margin.intra, y: margin.intra};

        return (
          <svg id="baseSvg"
               height={height}
               width={width}>
                  <Elbow height={commonHeight} width={firstRowWidth} margin={margin}
                         dataset={this.state.dataset} clusters={this.state.clusters}
                         onRunChange={this.updateFromElbow}/>

                  <Umap height={commonHeight} width={firstRowWidth} margin={umapMargin}
                        clusters={this.state.clusters[this.state.currentRun]} dataset={this.state.dataset}
                        colorScale={this.state.colorScale} distance={distance}
                        minDist={this.state.umap.minDist} nNeighbors={this.state.umap.nNeighbors}/>
          </svg>
        )
    }

    setNumRuns() {
        const component = this;
        return function(n) {component.setState(prevState => ({numRuns: prevState.numRuns + n}))}
    }

    parseDatasetFile() {
        const component = this;
        return async function(datasetFile) {
            const dataset = d3.csvParse(await datasetFile.text(), parseDatasetElement);
            component.setState({dataset: dataset})
        }
    }

    parseRunFile() {
        const component = this;
        return async function (runFile) {
            const m = runFile.name.match(/(centroids|clusters)_(\d+)\.csv/);
            if(m && m[1] === "centroids") component.state.centroids[m[2]] = d3.csvParse(await  runFile.text(), parseDatasetElement);
            else if(m && m[1] === "clusters") component.state.clusters[m[2]] = d3.csvParseRows(await runFile.text(), c => +c[0]);
            component.setState(prevState => ({ numRuns: prevState.numRuns - 1}))
        }
    }

    updateFromElbow(new_k) {
        // TODO: update other visualisations
    }
}

export default App;
