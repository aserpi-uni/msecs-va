import * as d3 from 'd3';
import React from "react";

import './Elbow.scss'
import varianceExplainedCsv from "./dataset/variance_explained.csv"


function dotOnClick(dot, i, dots) {
    const dotClicked = d3.select(this);
    if(dotClicked.classed("selected")) {
        return
    }

    d3.selectAll(dots).classed("selected", false);
    dotClicked.classed("selected", true);
    //TODO: update other visualisations
}

class Elbow extends React.Component {
    render() {
        return (
          <g id="elbowChart" className="elbow chart"
             width={this.props.width} height={this.props.height}
             transform={`translate(${this.props.margin.x},${this.props.margin.y})`} />
        )
    }

    async componentDidMount() {
        const varianceExplained = await d3.csv(varianceExplainedCsv, function (d) {
            return {
                k: +d.k,
                variance: +d.variance
            };
        });

        const svg = d3.select("#elbowChart"),
          h = this.props.height,
          w = this.props.width;

        const xScale = d3.scaleLinear()
          .domain([d3.min(varianceExplained, v => v.k) - 1, d3.max(varianceExplained, v => v.k) + 1])
          .range([0, w]);

        const yScale = d3.scaleLinear()
          .domain([0, 1])
          .range([h, 0]);

        // See https://github.com/d3/d3-shape/blob/master/README.md#curveMonotoneX
        const line = d3.line()
          .x(d => xScale(d.k))
          .y(d => yScale(d.variance))
          .curve(d3.curveMonotoneX);

        svg.append("path")
          .datum(varianceExplained)
          .attr("class", "elbow line")
          .attr("d", line);

        svg.append("g")
          .attr("class", "elbow axis x")
          .attr("transform", `translate(0, ${h})`)
          .call(d3.axisBottom(xScale));

        svg.append("g")
          .attr("class", "elbow axis y")
          .call(d3.axisLeft(yScale));

        svg.selectAll(".elbow.dot-k")
          .data(varianceExplained)
          .enter().append("circle")
            .attr("class", "elbow dot-k")
            .attr("cx", d => xScale(d.k))
            .attr("cy", d => yScale(d.variance))
            .attr("r", 5)
            .on("click", dotOnClick);
    }
}

export default Elbow