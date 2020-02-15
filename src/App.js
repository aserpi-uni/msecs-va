import React from 'react';
import './App.css';


import Elbow from "./Elbow";

// Need 4px of fake padding, otherwise Firefox displays scrollbars
function App() {
    const margin = {x: 50, y: 50, intra: 50},
      fakePadding = 4,
      firstRowWidth = (document.documentElement.clientWidth - fakePadding - 2*margin.x - 2*margin.intra) / 3,
      baseHeight = (document.documentElement.clientHeight - 2*margin.y - margin.intra) / 2;

    return (
        <div className="App">
            <svg id="baseSvg"
                 height={document.documentElement.clientHeight - fakePadding}
                 width={document.documentElement.clientWidth}>
                <Elbow height={baseHeight} width={firstRowWidth} margin={margin}/>
            </svg>
        </div>
    );
}

export default App;
