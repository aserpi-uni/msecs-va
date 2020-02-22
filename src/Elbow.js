import * as d3 from 'd3';
import d3tip from 'd3-tip'
import React, {useEffect} from "react";

import './Elbow.scss'
import {computeSse, computeVariance} from "./utils";


function Elbow(props) {
    function onDotClick(d, i, c) {
        const dotClicked = d3.select(this);
        if(dotClicked.classed("selected")) return;

        d3.selectAll(c).classed("selected", false);
        dotClicked.classed("selected", true);

        if(props.onRunChange !== undefined) props.onRunChange(d.k);
    }

    useEffect(function() {
        const svg = d3.select("#elbowChart"),
          h = props.height,
          w = props.width,
          metrics = [];

        for(let k of Object.keys(props.labels)) {
            k = +k;
            metrics.push({
                k: k,
                //metric: computeVariance(props.dataset, props.labels[k], k)
                metric: computeSse(props.dataset, props.labels[k], props.centroids[k])
            })
        }

        const xScale = d3.scaleLinear()
          .domain([d3.min(metrics, v => v.k) -1, d3.max(metrics, v => v.k) + 1])
          .range([0, w]);

        const yScale = d3.scaleLinear()
          .domain([d3.min(metrics, v => v.metric) * 0.9, d3.max(metrics, v => v.metric) * 1.1])
          .range([h, 0]);

        // See https://github.com/d3/d3-shape/blob/master/README.md#curveMonotoneX
        const line = d3.line()
          .x(d => xScale(d.k))
          .y(d => yScale(d.metric))
          .curve(d3.curveMonotoneX);

        svg.append("path")
          .datum(metrics)
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
          .html(k => `Clusters: <strong>${k.k}</strong><br>SSE: <strong>${k.metric}</strong>`)  // TODO: approximate metric
          .offset([-10, 0]);
        svg.call(tip);

        svg.selectAll(".elbow.dot-k")
          .data(metrics)
          .enter().append("circle")
            .attr("class", "elbow dot-k")
            .attr("cx", d => xScale(d.k))
            .attr("cy", d => yScale(d.metric))
            .attr("r", 5)
            .on("mouseover", tip.show)
            .on("mouseout", tip.hide)
    }, []);

    useEffect(function() {
        const dots = d3.selectAll(".elbow.dot-k");

        if(props.busy) {
            dots
              .style("cursor", "no-drop")
              .on("click", undefined)
        } else {
            dots
              .style("cursor", "pointer")
              .on("click",  onDotClick)
        }
    }, [props.busy]);

    return (
      <svg id="baseElbowChart" className="elbow chart"
           height={props.height + 2*props.padding.y} width={props.width + 2*props.padding.x}>
          <g id="elbowChart" className="elbow chart"
             height={props.height} width={props.width}
             transform={`translate(${props.padding.x},${props.padding.y})`}>
              <text className="elbow axis label x"
                    transform={`translate(${props.width/2},${props.height+3*props.padding.y/4})`}>
                  Number of clusters
              </text>

              <text className="elbow axis label y"
                    transform={`translate(-${2*props.padding.x/3},${props.height/2}),rotate(-90)`}>
                  Sum of squared errors
              </text>
          </g>
      </svg>
    )
}


export default Elbow
