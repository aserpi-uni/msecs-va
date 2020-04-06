import * as d3 from 'd3';
import d3tip from 'd3-tip'
import React, {useEffect} from "react";
import "./Silhouette.scss"
import {distance, categoricalFeatures, numericalFeatures, computeSilhouetteValue} from "./utils"
const silhouetteDict = {};
const clustersPerRun = {};
const sortedDataPerRun = {};
function Silhouette(props) {
    //console.log(props.centroids);

    const data = props.dataset;
    const h = props.height ,
        w = props.width ;
    let distanceMatrix = new Array(data.length);

    useEffect(function(){
        for(let i = 0; i < data.length; i++){
            let distanceRow = new Array(data.length)
            for(let j = 0; j < data.length; j++){
                //console.log("distance between data["+i+"] and data["+j+"]");
                distanceRow[j] = distance(data[i], data[j])
            }
            distanceMatrix[i] = distanceRow;
        }
        //console.log(distanceMatrix)
        const elements = data.length;
        // silhouetteDict is in the form of a dictionary in which each key corresponds to a point, and its value is a dictionary-object in which each key is a different run, and its value is its silhouette value.

        for(const [key,value] of  Object.entries(props.centroids)) {
            let clusters = {};
            let silhouetteValues = {};
            let currentLabels = props.labels[key];
            for(let i = 0; i < elements; i++){
                if(clusters[currentLabels[i]] === undefined){clusters[currentLabels[i]] = [];}
                clusters[currentLabels[i]].push([data[i], i]);
            }
            clustersPerRun[key] = clusters;
            for (let i = 0; i < elements; i++){
                const currentLabel = currentLabels[i];
                const currentIndex = i;
                let C_i = 0;
                let C_k = {};
                let sum_a_i = 0;
                let a_i = 0;
                let sum_b_i = {};
                let b_i_set = {};
                let b_i = 1;
                for(let j = 0; j < elements; j++){
                    if(currentLabels[j] === currentLabel){
                        C_i += 1; //number of elements in C_i
                        sum_a_i += distanceMatrix[currentIndex][j];
                    }
                    else {
                        if(C_k[currentLabels[j]] === undefined){
                            C_k[currentLabels[j]] = 0;
                            sum_b_i[currentLabels[j]] = 0;
                        }
                        C_k[currentLabels[j]] += 1; // number of elements for each C_k, with k != i
                        sum_b_i[currentLabels[j]] += distanceMatrix[currentIndex][j];
                    }
                }
                if(C_i === 1){silhouetteValues[i] = 0;}
                else {
                    a_i = sum_a_i / (C_i - 1);
                    const cluster_keys = Object.keys(C_k);
                    for (let subkey in cluster_keys) {
                        b_i_set[cluster_keys[subkey]] = sum_b_i[cluster_keys[subkey]]/C_k[cluster_keys[subkey]]
                    }
                    b_i = d3.min(Object.values(b_i_set));
                    let s_i = (b_i - a_i) / (d3.max([a_i, b_i]));
                    silhouetteValues[i] =  s_i;
                }
            }
            silhouetteDict[key]= silhouetteValues;
        }
        //sorting inside groups
        for(let run in clustersPerRun){
            for (let label in clustersPerRun[run]) {
                clustersPerRun[run][label].sort(function (a, b) {
                    return d3.descending(silhouetteDict[run][a[1]], silhouetteDict[run][b[1]])
                })
            }
        }
        for(let run in clustersPerRun){
            let sortedData = []
            let sortedLabels = []
            for(let label in clustersPerRun[run]){
                sortedLabels.push([label, clustersPerRun[run][label][0]])
            }
            sortedLabels.sort(function(a, b){return d3.descending(silhouetteDict[run][a[1][1]], silhouetteDict[run][b[1][1]])})
            for (let label in sortedLabels){
                for(let element in clustersPerRun[run][sortedLabels[label][0]]){
                    sortedData.push(clustersPerRun[run][sortedLabels[label][0]][element])
                }
            }
            sortedDataPerRun[run] = sortedData;
        }
        const rootSvg = d3.select("#rootSilhouetteChart")
        const svg = d3.select("#silhouetteChart")

        rootSvg.on("click", onBackgroundClicked);

        let yScale = d3.scaleLinear()
            .domain([-1, 1])
            .range([h, 0]);
        let xScale = d3.scaleLinear()
             .domain([0, data.length])
             .range([0,w])

        svg.append("g")
            .attr("class", "MyAxisX")
            .attr("transform", `translate(5, ${h})`)
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .attr("class", "MyAxisY")
            .call(d3.axisLeft(yScale));

    }, []);

    useEffect(function(){
        if(props.centroids[props.currentRun] !== undefined) {
            let xScale = d3.scaleBand()
                .domain(d3.range(0, data.length))
                .range([0, w]);
            let yScale = d3.scaleLinear()
                .domain([-1, 1])
                .range([h, 0]);
            const svg = d3.select("#silhouetteChart");
            svg.on("click", onBackgroundClicked);

            const update = svg;
            update.select(".MyAxisX")
                .call(d3.axisBottom(xScale).tickValues([0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1199]));

            const tip = d3tip()
                .attr("class", "silhouette tooltip")
                .html(d => silhouetteDict[props.currentRun][d[1]] + ", cluster: " + props.currentLabels[d[1]] + ", members: " + clustersPerRun[props.currentRun][props.currentLabels[d[1]]].length)
                .offset([-10, 0]);
            svg.call(tip);

            update.selectAll(".silhouetteBar")
                .remove()
                .exit()
                .data(sortedDataPerRun[props.currentRun])
                .enter()
                .append('rect')
                .attr("class", "silhouetteBar")
                .attr('x', (d, i) => xScale(i) + 5)
                .attr('width', xScale.bandwidth())
                .attr('y', (d, i) => yScale(silhouetteDict[props.currentRun][d[1]]))
                .attr('height', (d, i) => h-yScale(silhouetteDict[props.currentRun][d[1]]))
                .style("fill",(d, i) => props.colorScale(props.currentLabels[d[1]]))
                .style("opacity", 0.3)
                .on("click", onBarClicked)
                .on("mouseover",  d=>props.updateTemporarySelection(d[1]))
                .on("mouseenter", tip.show)
                .on("mouseout", d=>props.updateTemporarySelection(undefined))
                .on("mouseleave", tip.hide);

        }
    }, props.centroids[props.currentRun]);

    function onBarClicked(d) {
        d3.event.stopPropagation();
        props.updatePermanentSelection("add",[d[1]]);
    }
    function onBackgroundClicked() {
        // Shift+click on background is almost always a mis-click
        console.log("clicked background")
        d3.event.stopPropagation();
       props.updatePermanentSelection("set", new Set([]))
    }

    useEffect(function() {
        d3.selectAll(".silhouetteBar")
            //.transition(d3.transition().duration(50))
            .style("opacity", calcOpacityTemp)
    }, [props.temporarySelection]);
    useEffect(function(){
        d3.selectAll(".silhouetteBar")
            .style("opacity", calcOpacityPerm)
    }, [props.permanentSelection]);

    function calcOpacityTemp(d){
        if (d[1] === props.temporarySelection){
            return 0.9;
        }
        else if(props.permanentSelection.has(d[1])){
            return 0.9;
        }
        else return 0.3;
    }
    function calcOpacityPerm(d){
        if(props.permanentSelection.has(d[1])){
            return 0.9;
        }
        else return 0.3;
    }

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
