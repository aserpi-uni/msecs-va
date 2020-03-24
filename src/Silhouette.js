import * as d3 from 'd3';
import d3tip from 'd3-tip'
import React, {useEffect} from "react";
import "./ParallelCoordinates.scss"
import {distance, categoricalFeatures, numericalFeatures, computeSilhouetteValue} from "./utils"


function Silhouette(props) {
    console.log(props.centroids);

    const data = props.dataset;
    const h = props.height ,
        w = props.width ;
    let distanceMatrix = new Array(data.length);

    let silhouetteDict = {};
    useEffect(function(){
        for(let i = 0; i < data.length; i++){
            let distanceRow = new Array(data.length)
            for(let j = 0; j < data.length; j++){
                //console.log("distance between data["+i+"] and data["+j+"]");
                distanceRow[j] = distance(data[i], data[j])
            }
            distanceMatrix[i] = distanceRow;
        }
        console.log(distanceMatrix)
        for (let i in data.length){
            for(let key in props.centroids) {
                silhouetteDict[key] = computeSilhouetteValue(data, props.centroids[key], distanceMatrix, i, props.labels[i], props.labels);
            }
        }
        const svg = d3.select("#silhouetteChart");

        let yScale = d3.scaleLinear()
            .domain([-1, 1])
            .range([h, 0]);
        let xScale = d3.scaleLinear()
             .domain([0, data.length])
             .range([0,w])
            //.padding("0.05");
        svg.append("g")
            .attr("class", "MyAxisX")
            .attr("transform", `translate(0, ${h})`)
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .attr("class", "MyAxisY")
            .call(d3.axisLeft(yScale));

        /*svg.enter().append("rect")
            .attr("class", "silhouette bar")
            .attr("x", (d, i) => xScale(i))
            .attr("y", function(d){return yScale(h);})
            .attr("height", function(d){return (h);})
            .attr("width", xScale.bandwidth())*/

    }, []);

    useEffect(function(){
        if(props.centroids[props.currentRun] !== undefined) {
            console.log(props.currentRun)
            /*let xScale = d3.scaleBand()
                .domain(d3.range(0, data.length))
                .range([0,w])*/
            let xScale = d3.scaleBand()
                .domain(d3.range(0, data.length))
                .range([0, w])
            let yScale = d3.scaleLinear()
                .domain([-1, 1])
                .range([h, 0]);
            const svg = d3.select("#silhouetteChart");
            svg.select(".MyAxisX")
                .call(d3.axisBottom(xScale));

            d3.selectAll(".silhouette.bar")
                .data(data)
                .enter()
                .append('rect')
                .attr("class", "silhouette bar")
                .attr('x', (d, i) => xScale(i))
                .attr('width', xScale.bandwidth())
                .attr('y', (d, i, data) => yScale(computeSilhouetteValue(data, props.centroids[props.currentRun], distanceMatrix, i, props.labels[i], props.labels)))
                .attr('height', (d, i, data) => h - yScale(computeSilhouetteValue(data, props.centroids[props.currentRun], distanceMatrix, i, props.labels[i], props.labels)))

        }


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
