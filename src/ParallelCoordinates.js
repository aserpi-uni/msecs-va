import * as d3 from 'd3';
import d3tip from 'd3-tip'
import React, {useEffect} from "react";

function ParallelCoordinates(props) {
    const h = props.height ;
    const w = props.width ;
    const dimensions = d3.keys(props.dataset[0]);
    useEffect(function() {
        let y = {}
        let i;
        let attribute
        for (i in dimensions) {  // here is to change with the names of the attributes
            attribute = dimensions[i];
            y[attribute] = d3.scaleLinear()
                .domain(d3.extent(data, function(d){return +d[attribute];}))
                .range([h, 0]);
        };
        let x;
        x = d3.scalePoint()
            .range([0, w])
            .padding(1)
            .domain(dimensions);
        function path(d) {
            return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
        }

        const svg = d3.select("#paralCoordChart")
        svg.append("g")
            .attr("class", "paralCoord axis x")
            .attr("transform", `translate(0, ${h})`)
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .attr("class", "paralCoord axis y")
            .call(d3.axisLeft(yScale));



    });






}

