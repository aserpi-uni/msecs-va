import * as d3 from 'd3';
import d3tip from 'd3-tip'
import React, {useEffect} from "react";
import "./ParallelCoordinates.scss"
import {categoricalFeatures, numericalFeatures} from "./utils"

function ParallelCoordinates(props) {
    useEffect(function() {
        const data = props.dataset
        const dimensions = d3.keys(data[0])
        console.log("dimensions: "+ dimensions)
        const svg = d3.select("#paralCoordChart"),
            h = props.height ,
            w = props.width ;
        let yScale = {}
        let i;
        let attribute;
        for (i in dimensions) {
            attribute = dimensions[i];
            console.log("attribute:"+ attribute)
            if(numericalFeatures.includes(attribute)){
                yScale[attribute] = d3.scaleLinear()
                    .domain(d3.extent(data, function(d){return +d[attribute];}))
                    .range([h, 0]);}
            else if (categoricalFeatures.includes(attribute)){
                yScale[attribute] = d3.scalePoint()
                    .domain(data, function(d){return +d[attribute];})
                    .range([h, 0]);
            }
            else throw Error("Unrecognizable attribute")
        };
        let xScale;
        xScale = d3.scalePoint()
            .domain(dimensions)
            .range([0, w])
            .padding(1);

        function path(d) {
            return d3.line()(dimensions.map(function(p) { return [xScale(p), yScale[p](d[p])]; }));
        }


        // Draw the path:
        svg
            .selectAll("myPath")
            .data(data)
            .enter().append("path")
            .attr("d",  path)
            .style("fill", "none")
            .style("stroke", "#69b3a2")
            .style("opacity", 0.5)

        // Draw the axis: (this is done after the path so that the axis is on top of the lines)
        svg.selectAll("myAxis")
            // For each dimension of the dataset I add a 'g' element:
            .data(dimensions).enter()
            .append("g")
            // I translate this element to its right position on the x axis
            .attr("transform", function(d) { return "translate(" + xScale(d) + ")"; })
            // And I build the axis with the call function
            .each(function(d) { d3.select(this).call(d3.axisLeft().scale(yScale[d])); })
            // Add axis title
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -9)
            .text(function(d) { return d; })
            .style("fill", "black")
    }, []);

        return (
            <svg id="baseParalCoordChart" className="paralCoord chart"
                 height={props.height + 2*props.padding.y} width={props.width + 2*props.padding.x}>
                <g id="paralCoordChart" className="paralCoord chart"
                   height={props.height} width={props.width}
                   transform={`translate(${props.padding.x},${props.padding.y})`}>
                </g>
            </svg>
        )

}

export default ParallelCoordinates

