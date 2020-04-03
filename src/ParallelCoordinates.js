import * as d3 from 'd3';
import d3tip from 'd3-tip'
import React, {useEffect} from "react";
import "./ParallelCoordinates.scss"
import {categoricalFeatures, numericalFeatures} from "./utils"

function ParallelCoordinates(props) {
    const data = props.dataset
    const indices = (Object.keys(data))

    useEffect(function() {
        const dimensions = d3.keys(data[0]);
        //console.log(dimensions);
        const svg = d3.select("#paralCoordChart"),
            h = props.height ,
            w = props.width ;
        let yScale = {}
        let i;
        let attribute;
        for (i in dimensions) {
            //console.log("for loop"+i)
            attribute = dimensions[i];
            //console.log("attribute:"+ attribute)
            if(numericalFeatures.includes(attribute)) {
                yScale[attribute] = d3.scaleLinear()
                    .domain(d3.extent(data, function (d) {
                        return +d[attribute];
                    }))
                    .range([h, 0])
            }
            else if (categoricalFeatures.includes(attribute)){
                yScale[attribute] = d3.scalePoint()
                    .domain(data.map(function(d){return d[attribute];}))
                    .range([h, 0])
                    .padding(1);

            }
            else throw Error("Unrecognizable attribute")
        };
        let xScale;
        xScale = d3.scalePoint()
            .domain(dimensions)
            .range([0, w])
            .padding(1);

        //let color;
        //color = d3.scaleOrdinal()
         //   .domain(props.labels)
          //  .range(props.colorScale);

        //console.log(props.colorScale);

        function path(d) {
            return d3.line()(dimensions.map(function(p) { return [xScale(p), yScale[p](d[p])]; }));
        }

        // Draw the path:
        svg.selectAll("myPath")
            .data(data)
            .enter().append("path")
            //.classed("permanent-selection", (d, i) => props.permanentSelection.has(i))
            //.classed("temporary-selection", (d, i) => i === props.temporarySelection)
            .attr("class", "path line")
            .attr("d",  path)
            .style("fill", "none")
            .style("stroke", "lightgrey")
            .style("opacity", 0.02)

        // Draw the axis: (this is done after the path so that the axis is on top of the lines)
        let g = svg.selectAll(".dimension")
            // For each dimension of the dataset I add a 'g' element:
            .data(dimensions)
            .enter().append("g")
            .attr("class", "dimension")
            // I translate this element to its right position on the x axis
            .attr("transform", function(d) { return "translate(" + xScale(d) + ")"; })
            // I add the drag behavior on each axis
            /*.call(d3.behavior.drag()
                .origin(function (d){return {x: xScale(d)};})
                .on("dragstart"), function(d){
                dragging[d] = xScale(d);
                background
            })*/

        g.append("g")
            // And I build the axis with the call function
            .each(function(d) { d3.select(this).call(d3.axisLeft().scale(yScale[d])); })
            // Add axis title
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -9)
            .text(function(d) { return d; })
            .style("fill", "black")

        g.append("g")
            .attr("class", "brush")
            .each(function(d) {
                d3.select(this)
                    .call(yScale[d].brush = d3.brushY()
                        .extent([[-10,0], [10,h]])
                        .on("start", brushstart)
                        .on("brush", brush)
                        .on("end", brush));
            })
            .selectAll("rect")
            .attr("x", -8)
            .attr("width", 16);

        function brushstart() {
            props.updatePermanentSelection("delete", props.permanentSelection)
        }

        // Handles a brush event, toggling the display of foreground lines.
        function brush() {
            if (!d3.event.sourceEvent) return;
            if(! d3.event.selection) return;
            let actives = [];
            const selection = d3.event.selection;
            let svg = d3.selectAll("#paralCoordChart")
            svg.selectAll(".brush")
                .filter(function(d){
                    //console.log("sono nel filter " + d)
                    //console.log(yScale[d])
                    yScale[d].brushSelectionValue = d3.brushSelection(this);
                    //console.log(d)
                    //console.log(yScale[d].brushSelectionValue);
                    return d3.brushSelection(this);
                })
                .each(function(d){
                    //console.log(d)
                    //if (!d3.event.sourceEvent) return; // Only transition after input.
                    //if (!d3.event.selection) return;
                    if(numericalFeatures.includes(d)) {
                        //console.log(d3.event.selection.map(yScale[d]))
                        const range = d3.event.selection.map(yScale[d].invert)
                        //console.log(range)
                        actives.push({
                            dimension: d,
                            extent: d3.event.selection.map(yScale[d].invert)
                        });
                    }
                    else if(categoricalFeatures.includes(d)){
                        const range = yScale[d].domain().map(yScale[d]).reverse()
                        /*console.log("categorical feature")
                        console.log(range)
                        console.log(range.length)
                        console.log(selection)*/
                        if(selection == null) return;
                        const i0 = d3.bisectRight(range, selection[0]);
                        const i1 = d3.bisectRight(range, selection[1]);
                        //console.log(i0 + " " + i1)
                        let slice = yScale[d].domain().reverse().slice(i0, i1)
                        //console.log(slice)
                        actives.push({
                            dimension: d,
                            extent: yScale[d].domain().reverse().slice(i0, i1)
                        })
                    }
                });
            console.log(actives)

            let selected = [];
            for(let d in data){
                //console.log(d)
                let isActive = actives.every(function(active) {
                    if(numericalFeatures.includes(active.dimension)) {
                        let result = active.extent[1] <= data[d][active.dimension] && data[d][active.dimension] <= active.extent[0];
                        //if(result){console.log(data[d][active.dimension])}
                        return result;
                    }
                    else if(categoricalFeatures.includes(active.dimension)){
                        let result = active.extent.includes(data[d][active.dimension])
                        //if(result){console.log(data[d][active.dimension])}
                        return result
                    }
                })
                if(isActive) {
                    selected.push(parseInt(d));
                }
            };
            //console.log(new Set(selected)

            props.updatePermanentSelection("add", selected)

            //props.updatePermanentSelection("set", new Set(selected));
            //console.log(props.permanentSelection)

        }
    }, []);
    // Functions for colourings, and selections
    useEffect(function() {
        //console.log("sono in useEffect")
        if(props.labels === undefined) return;
        d3.selectAll(".path.line")
            .transition(d3.transition().duration(750))
            .style("stroke",(d, i) => props.colorScale(props.labels[i]))
            .style("opacity", 0.02)
        }, [props.labels]);

    useEffect(function() {
        //console.log(props.permanentSelection)
        d3.selectAll(".path.line")
            //.transition(d3.transition().duration(750))
            .style("opacity", calcOpacityPerm)
    }, [props.permanentSelection]);

    useEffect(function() {
        d3.selectAll(".path.line")
            //.transition(d3.transition().duration(120))
            .style("opacity", calcOpacityTemp)
    }, [props.temporarySelection]);
    function calcOpacityTemp(d, i){
        if(props.temporarySelection !== undefined){
            if (i === props.temporarySelection){
                return 0.9;
            }
            else if(props.permanentSelection.has(i)) {return 0.9;}
            else return 0.02;
        }
        else if (props.permanentSelection.has(i)){return calcOpacityPerm;}
        else return 0.02;
    }
    function calcOpacityPerm(d, i){
        //console.log(props.permanentSelection)
        if(props.permanentSelection !== undefined){
            if (props.permanentSelection.has(i)){
                //console.log(i)
                return 0.9;
            }
            else {
                //console.log("permanentSelection undefined")
                return 0.02;}
        }
        else {

            return 0.02;}
    }

    function calcOpacity(d, i){
        if(props.temporarySelection !== undefined && props.permanentSelection !== undefined){
            if (i === props.temporarySelection || props.permanentSelection.has(i) ){
                return 1;
            }
            else return 0.02;
        }
    }


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

