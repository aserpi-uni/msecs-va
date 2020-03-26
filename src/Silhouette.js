import * as d3 from 'd3';
import d3tip from 'd3-tip'
import React, {useEffect} from "react";
import "./ParallelCoordinates.scss"
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
                        /*console.log("point and label (C_i)")
                        console.log(j)
                        console.log(data[j])
                        console.log(currentLabels[j])*/
                        C_i += 1; //number of elements in C_i
                        sum_a_i += distanceMatrix[currentIndex][j];
                    }
                    else {
                        /*console.log("point and label (C_k)")
                        console.log(j)
                        console.log(data[j])
                        console.log(currentLabels[j])*/
                        if(C_k[currentLabels[j]] === undefined){
                            C_k[currentLabels[j]] = 0;
                            sum_b_i[currentLabels[j]] = 0;
                        }
                        C_k[currentLabels[j]] += 1; // number of elements for each C_k, with k != i
                        //console.log("distanceMatrix["+currentIndex+"]["+j+"] :"+distanceMatrix[currentIndex][j])
                        sum_b_i[currentLabels[j]] += distanceMatrix[currentIndex][j];
                    }
                }
                /*console.log(C_i);
                console.log(sum_a_i);
                console.log(C_k);
                console.log("C_k object entries:")
                console.log(Object.entries(C_k))
                console.log("sum b_i:")
                console.log(sum_b_i);*/
                if(C_i === 1){silhouetteValues[i] = 0;}
                else {
                    a_i = sum_a_i / (C_i - 1);
                    const cluster_keys = Object.keys(C_k);
                    //console.log("cluster_keys:")
                    //console.log(cluster_keys)
                    for (let subkey in cluster_keys) {
                        /*console.log("sum b_i["+clusters[subkey]+"]:")
                        console.log(sum_b_i[clusters[subkey]]);
                        console.log("C_k[clusters["+subkey+"]]:")
                        console.log(C_k[clusters[subkey]])
                        console.log(sum_b_i[clusters[subkey]]/C_k[clusters[subkey]])*/
                        b_i_set[cluster_keys[subkey]] = sum_b_i[cluster_keys[subkey]]/C_k[cluster_keys[subkey]]
                        /*console.log("results:")
                        console.log(b_i_set)*/
                    }
                    //console.log(a_i)
                    //console.log(b_i_set)
                    //console.log(d3.min(Object.values(b_i_set)))
                    b_i = d3.min(Object.values(b_i_set));
                    //console.log("a_i: "+a_i)
                    //console.log("b_i: "+b_i)
                    //console.log("max(a_i, b_i): "+d3.max([a_i, b_i]))
                    let s_i = (b_i - a_i) / (d3.max([a_i, b_i]));
                    //console.log("s_i: " +s_i)
                    silhouetteValues[i] =  s_i;
                }
            }
            silhouetteDict[key]= silhouetteValues;
        }
        /*for(const [key,value] of  Object.entries(props.centroids)) {
            let silhouetteValues = {}
            for (let i = 0; i < elements; i++) {
                silhouetteValues[i] = 0;
            }
            silhouetteDict[0] = silhouetteValues;
        }*/
        //console.log("Before sorting:");
        //console.log(clustersPerRun);
        //sorting inside groups
        for(let run in clustersPerRun){
            for (let label in clustersPerRun[run]) {
                clustersPerRun[run][label].sort(function (a, b) {
                    return d3.descending(silhouetteDict[run][a[1]], silhouetteDict[run][b[1]])
                })
            }
        }
        console.log(clustersPerRun)
        for(let run in clustersPerRun){
            let sortedData = []
            let sortedLabels = []
            for(let label in clustersPerRun[run]){
                sortedLabels.push([label, clustersPerRun[run][label][0]])
            }
            sortedLabels.sort(function(a, b){return d3.descending(silhouetteDict[run][a[0]], silhouetteDict[run][b[0]])})
            console.log(sortedLabels)
            for (let label in sortedLabels){
                //console.log(sortedLabels[label])
                //console.log(clustersPerRun[run][sortedLabels[label][0]])
                for(let element in clustersPerRun[run][sortedLabels[label][0]]){
                    sortedData.push(clustersPerRun[run][sortedLabels[label][0]][element])
                }
                console.log(sortedData)
            }
            sortedDataPerRun[run] = sortedData;
        }
        console.log(sortedDataPerRun)
        //sortedDataPerRun
        /*console.log("After sorting:");
        console.log(clustersPerRun);
        for(let i = 0; i<clustersPerRun[2][1].length; i++){
            console.log(silhouetteDict[2][clustersPerRun[2][1][i][1]])
        }
        console.log(silhouetteDict);*/
        const svg = d3.select("#silhouetteChart")

        let yScale = d3.scaleLinear()
            .domain([-1, 1])
            .range([h, 0]);
        let xScale = d3.scaleLinear()
             .domain([0, data.length])
             .range([0,w])
            //.padding("0.05");
        /*let xScale = d3.scaleBand()
            .domain(d3.range(0, data.length))
            .range([0, w]);*/
        svg.append("g")
            .attr("class", "MyAxisX")
            .attr("transform", `translate(0, ${h})`)
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .attr("class", "MyAxisY")
            .call(d3.axisLeft(yScale));


        /*svg.selectAll(".silhouetteBar")
            .data(data)
            .enter().append("rect")
            .attr("class", "silhouetteBar")
            .attr('x', (d, i) => xScale(i))
            .attr('width', xScale.bandwidth())
            .attr('y', (d, i) => yScale(silhouetteDict[0][i]))
            .attr('height', (d, i) => h - yScale(silhouetteDict[0][i]))*/

    }, []);

    /*useEffect(function(){
        if(props.centroids[props.currentRun] !== undefined) {
            console.log("current run : "+props.currentRun)
            console.log(silhouetteDict)
            //console.log("silhouetteDict[props.currentRun][0]: "+silhouetteDict[props.currentRun][0])
            let xScale = d3.scaleBand()
                .domain(d3.range(0, data.length))
                .range([0, w]);
            let yScale = d3.scaleLinear()
                .domain([-1, 1])
                .range([h, 0]);
            const svg = d3.select("#silhouetteChart");
            const update = svg;
            update.select(".MyAxisX")
                .call(d3.axisBottom(xScale).tickValues([0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1199]));

            update.selectAll(".silhouetteBar")
                .remove()
                .exit()
                .data(data)
                .enter()
                .append('rect')
                .attr("class", "silhouetteBar")
                .attr('x', (d, i) => xScale(i))
                .attr('width', xScale.bandwidth())
                .attr('y', (d, i) => yScale(silhouetteDict[props.currentRun][i]))
                .attr('height', (d, i) => h - yScale(silhouetteDict[props.currentRun][i]))
                .style("fill",(d, i) => props.colorScale(props.currentLabels[i]))

        }


    }, props.centroids[props.currentRun]);*/

    useEffect(function(){
        if(props.centroids[props.currentRun] !== undefined) {
            console.log("current run : "+props.currentRun)
            console.log(silhouetteDict)
            //console.log("silhouetteDict[props.currentRun][0]: "+silhouetteDict[props.currentRun][0])
            let xScale = d3.scaleBand()
                .domain(d3.range(0, data.length))
                .range([0, w]);
            let yScale = d3.scaleLinear()
                .domain([-1, 1])
                .range([h, 0]);
            const svg = d3.select("#silhouetteChart");
            const update = svg;
            update.select(".MyAxisX")
                .call(d3.axisBottom(xScale).tickValues([0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1199]));

            update.selectAll(".silhouetteBar")
                .remove()
                .exit()
                .data(sortedDataPerRun[props.currentRun])
                .enter()
                .append('rect')
                .attr("class", "silhouetteBar")
                .attr('x', (d, i) => xScale(i))
                .attr('width', xScale.bandwidth())
                .attr('y', (d, i) => yScale(silhouetteDict[props.currentRun][d[1]]))
                .attr('height', (d, i) => h - yScale(silhouetteDict[props.currentRun][d[1]]))
                .style("fill",(d, i) => props.colorScale(props.currentLabels[d[1]]))
                .style("opacity", 0.3)
                .on("mouseenter", (d, i) => props.updateTemporarySelection(d[1]))
                .on("mouseout", () => props.updateTemporarySelection(undefined));

        }


    }, props.centroids[props.currentRun]);

    useEffect(function() {
        d3.selectAll(".silhouetteBar")
            .transition(d3.transition().duration(50))
            .style("opacity", calcOpacityTemp)
    }, [props.temporarySelection]);

    function calcOpacityTemp(d){
        if (d[1] === props.temporarySelection){
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
