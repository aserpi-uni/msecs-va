import * as d3 from 'd3';
import d3tip from 'd3-tip'
import React, {useEffect} from "react";

import './Elbow.scss'
import varianceExplainedCsv from "./dataset/variance_explained.csv"


function Elbow(props) {
    function onDotClick(d, i, c) {
        const dotClicked = d3.select(this);
        if(dotClicked.classed("selected")) return;

        d3.selectAll(c).classed("selected", false);
        dotClicked.classed("selected", true);

        if(props.onRunChange !== undefined) props.onRunChange(d.k);
    }

    useEffect(function() {
        console.log("fired");

        async function displayVariance() {
            const varianceExplained = await d3.csv(varianceExplainedCsv, function (d) {
                return {
                    k: +d.k,
                    variance: +d.variance
                };
            });

            const svg = d3.select("#elbowChart"),
              h = props.height,
              w = props.width;

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

            const tip = d3tip()
              .attr("class", "elbow tooltip")
              .html(k => `Clusters: <strong>${k.k}</strong><br>Variance explained: <strong>${k.variance}</strong>`)
              .offset([-10, 0]);
            svg.call(tip);

            svg.selectAll(".elbow.dot-k")
              .data(varianceExplained)
              .enter().append("circle")
                .attr("class", "elbow dot-k")
                .attr("cx", d => xScale(d.k))
                .attr("cy", d => yScale(d.variance))
                .attr("r", 5)
                .on("mouseover", tip.show)
                .on("mouseout", tip.hide)
                .on("click", onDotClick);
        }

        displayVariance()
    });

    console.log(props);

    return (
      <g id="elbowChart" className="elbow chart"
         width={props.width} height={props.height}
         transform={`translate(${props.margin.x},${props.margin.y})`}>
          <text className="elbow axis label x"
                transform={`translate(${props.width/2},${props.height+2*props.margin.y/3})`}>
              Clusters
          </text>
          <text className="elbow axis label y"
                transform={`translate(-${2*props.margin.x/3},${props.height/2}),rotate(-90)`}>
              Variance explained
          </text>
      </g>
    )
}

export default Elbow
