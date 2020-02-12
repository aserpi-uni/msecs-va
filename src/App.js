import * as d3 from "d3";
import React from 'react';

import './App.scss';
import Elbow from "./Elbow";
import Umap from "./Umap";
import mainDataset from "./dataset/dataset.csv";


// TODO: use an alternative id method than HTML id
class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            colorScale: 'dimgrey',
            dataset: undefined,
            umap: {
                nNeighbors: 15,
                minDist: 0.1,
                spread: 1.0
            }
        }
    }

    render() {
        const margin = {x: 50, y: 50, intra: 50},
          fakePadding = 4,  // Need 4px of fake padding, otherwise Firefox displays scrollbars
          commonHeight = (document.documentElement.clientHeight - fakePadding - 2*margin.y - margin.intra) / 2,
          firstRowWidth = (document.documentElement.clientWidth - 2*margin.x - 2*margin.intra) / 3;

        const umapMargin = {x: margin.x + 2*firstRowWidth + 2*margin.intra, y: margin.intra};

        return (
          <div className="App">
              <svg id="baseSvg"
                   height={document.documentElement.clientHeight - fakePadding}
                   width={document.documentElement.clientWidth}>
                  <Elbow height={commonHeight} width={firstRowWidth} margin={margin}
                         onRunChange={this.updateFromElbow}/>
                  {
                      this.state.dataset &&
                      <Umap height={commonHeight} width={firstRowWidth} margin={umapMargin}
                            nNeighbors={this.state.umap.nNeighbors}
                            minDist={this.state.umap.minDist} spread={this.state.umap.spread}
                            dataset={this.state.dataset} colorScale={this.state.colorScale}/>
                  }
              </svg>
          </div>
        )
    }

    async componentDidMount() {
        this.setState({
            dataset: await d3.csv(mainDataset, function (d) {
                return {
                    f1: +d.f1,
                    f2: +d.f2,
                    f3: d.f3,
                    f4: +d.f4,
                    f5: d.f5,
                    f6: d.f6,
                    f7: d.f7,
                    f8: +d.f8
                }
            })
        });
    }

    updateFromElbow(new_k) {
        // TODO: update other visualisations
    }
}

export default App;
