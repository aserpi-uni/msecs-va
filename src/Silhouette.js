import * as d3 from 'd3';
import d3tip from 'd3-tip'
import React, {useEffect} from "react";
import "./ParallelCoordinates.scss"
import {distance, categoricalFeatures, numericalFeatures, computeSilhouetteValue} from "./utils"


function Silhouette(props) {
    const data = props.dataset
    let distanceMatrix = []
    let i,j;
    for(i in data.length){
        distanceMatrix[i] = []
    }
    useEffect(function(){
        for(i in data.length){
            for(j in data.length){
                distanceMatrix[i][j] = distance(data[i], data[j])
            }
        }
        const svg = d3.select("#silhouetteChart"),
            h = props.height ,
            w = props.width ;
        let xScale = d3.scaleLinear()
            .domain([-1, 1])
            .range([0, w]);
        let yScale = d3.scaleBand()
             .domain(data.map(function(d, i){return i}))
             .range([h, 0])
            .padding("0.05")
        svg.append("g")
            .attr("class", "MyAxisX")
            .attr("transform", `translate(0, ${h})`)
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .attr("class", "MyAxisY")
            .call(d3.axisLeft(yScale));

        svg.append("rect")
            .attr("class", "silhouette bar")
            .attr("x", xScale(0))
            .attr("y", (d, i) => yScale(i))
            .attr("height", yScale.bandwidth())
            .attr("width", xScale(0))

    }, []);

    useEffect(function(){

            /*const svg = d3.select("#silhouetteChart"),
                h = props.height,
                w = props.width;
            let yScale = d3.scaleBand()
                .domain([0, data.length])
                .range([h, 0])
            let xScale = d3.scaleLinear()
                .domain([-1, 1])
                .range([0, w]);
            d3.select(".MyAxisY")
                .call(d3.axisLeft(yScale));
            svg.selectAll(".silhouette.bar")
                .data(props.dataset)
                .enter()
                .append('rect')
                .attr("class", "silhouette bar")
                .attr('y', (d, i) => yScale(i))
                .attr('x', (d, i) => xScale(0))
                .attr('height', (d, i, data) => xScale(computeSilhouetteValue(data, props.centroids[props.currentRun], distanceMatrix, i, props.labels[i], props.labels)))
                .attr('width', yScale.bandwidth())*/



    }, props.centroids[props.currentRun]);

    return (
        <svg id="baseSilhouetteChart" className="silhouette chart"
             height={props.height + 2*props.padding.y} width={props.width + 2*props.padding.x}>
            <g id="silhouetteChart" className="silhouette chart"
               height={props.height} width={props.width}
               transform={`translate(${props.padding.x},${props.padding.y})`}>
            </g>
        </svg>
    )
}
export default Silhouette
