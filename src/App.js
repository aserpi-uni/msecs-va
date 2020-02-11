import React from 'react';

import './App.scss';
import Elbow from "./Elbow";


// TODO: use an alternative id method than HTML id
class App extends React.Component {
    render() {
        const margin = {x: 50, y: 50, intra: 50},
          fakePadding = 4,  // Need 4px of fake padding, otherwise Firefox displays scrollbars
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
        )
    }

    updateFromElbow(new_k) {
        // TODO: update other visualisations
    }
}

export default App;
