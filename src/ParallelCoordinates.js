import * as d3 from 'd3';
import d3tip from 'd3-tip'
import React, {useEffect} from "react";
import "./ParallelCoordinates.scss"
import {categoricalFeatures, numericalFeatures} from "./utils"

function ParallelCoordinates(props) {
    const data = props.dataset;
    const dimensions = d3.keys(props.dataset[0]);
    useEffect(function() {
        const svg = d3.select("#paralCoordChart"),
            h = props.height ,
            w = props.width ;
        let yScale = {}
        let i;
        let attribute;
        for (i in dimensions) {
            attribute = dimensions[i];
            if(attribute in numericalFeatures){
                yScale[attribute] = d3.scaleLinear()
                    .domain(d3.extent(data, function(d){return +d[attribute];}))
                    .range([h, 0]);}
            else if (attribute in categoricalFeatures){
                yScale[attribute] = d3.scaleOrdinal()
                    .domain(d3.extent(data, function(d){return +d[attribute];}))
                    .range([h, 0]);
            }
        };
        let xScale;
        xScale = d3.scalePoint()
            .domain(dimensions)
            .range([0, w])
            .padding(1);

        function path(d) {
            return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
        }


        svg.append("g")
            .attr("class", "paralCoord axis x")
            .attr("transform", `translate(0, ${h})`)
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .attr("class", "paralCoord axis y")
            .call(d3.axisLeft(yScale));

        // Draw the axis:
        svg.selectAll("myAxis")
            // For each dimension of the dataset I add a 'g' element:
            .data(dimensions).enter()
            .append("g")
            // I translate this element to its right position on the x axis
            .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
            // And I build the axis with the call function
            .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
            // Add axis title
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -9)
            .text(function(d) { return d; })
            .style("fill", "black")



    });






}

