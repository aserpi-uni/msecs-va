import React from 'react';
import './App.scss';


import Elbow from "./Elbow";

// Need 4px of fake padding, otherwise Firefox displays scrollbars
function App() {
    function updateFromElbow(new_k) {
        // TODO: update other visualisations
    }

    const margin = {x: 50, y: 50, intra: 50},
      fakePadding = 4,
      commonHeight = (document.documentElement.clientHeight - fakePadding - 2*margin.y - margin.intra) / 2,
      firstRowWidth = (document.documentElement.clientWidth - 2*margin.x - 2*margin.intra) / 3;

    return (
        <div className="App">
            <svg id="baseSvg"
                 height={document.documentElement.clientHeight - fakePadding}
                 width={document.documentElement.clientWidth}>
                <Elbow height={commonHeight} width={firstRowWidth} margin={margin}
                         onRunChange={this.updateFromElbow}/>
            </svg>
        </div>
    );
}

export default App;
