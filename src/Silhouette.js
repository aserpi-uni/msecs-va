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
        //console.log(distanceMatrix)
        const elements = data.length;
        // silhouetteDict is in the form of a dictionary in which each key corresponds to a point, and its value is a dictionary-object in which each key is a different run, and its value is its silhouette value.

            for(const [key,value] of  Object.entries(props.centroids)) {
                let silhouetteValues = {};
                let currentLabels = props.labels[key];
                for (let i = 0; i < elements; i++){
                    const currentLabel = currentLabels[i];
                    const currentIndex = i;
                    let C_i = 0;
                    let C_k = {};
                    let sum_a_i = 0;
                    let sum_b_i = {};
                    let b_i = 1;
                    let a_i, b_i_set = {};
                    for(let j = 0; j < elements; j++){
                        if(currentLabels[j] === currentLabel){
                            C_i += 1; //number of elements in C_i
                            sum_a_i += distanceMatrix[currentIndex][j];
                        }
                        else {
                            if(C_k[currentLabels[j]] === undefined){C_k[currentLabels[j]] = 0;}
                            C_k[currentLabels[j]] += 1; // number of elements for each C_k, with k != i
                            sum_b_i[j] += distanceMatrix[currentIndex][j];
                        }
                    }
                    if(C_i === 1){silhouetteValues[i] = 0;}
                    else {
                        a_i = sum_a_i / (C_i - 1);
                        for (let key in C_k) {
                            b_i_set[key.toString()] = sum_b_i[key] / (C_k[key]);
                            if (b_i_set[key] < b_i) {
                                b_i = b_i_set[key];
                            }
                        }
                        let s_i = (b_i - a_i) / (d3.max([a_i, b_i]));
                        silhouetteValues[i] =  s_i;
                    }
            }
            silhouetteDict[key]= silhouetteValues;
        }
        for(const [key,value] of  Object.entries(props.centroids)) {
            let silhouetteValues = {}
            for (let i = 0; i < elements; i++) {
                silhouetteValues[i] = 0;
            }
            silhouetteDict[0] = silhouetteValues;
        }
        console.log(silhouetteDict);
        const svg = d3.select("#silhouetteChart")

        let yScale = d3.scaleLinear()
            .domain([-1, 1])
            .range([h, 0]);
        /*let xScale = d3.scaleLinear()
             .domain([0, data.length])
             .range([0,w])
            //.padding("0.05");*/
        let xScale = d3.scaleBand()
            .domain(d3.range(0, data.length))
            .range([0, w])
        svg.append("g")
            .attr("class", "MyAxisX")
            .attr("transform", `translate(0, ${h})`)
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .attr("class", "MyAxisY")
            .call(d3.axisLeft(yScale));

        svg.selectAll(".silhouette.bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "silhouette bar")
            .attr('x', (d, i) => xScale(i))
            .attr('width', xScale.bandwidth())
            .attr('y', (d, i) => yScale(silhouetteDict[0][i]))
            .attr('height', (d, i) => h - yScale(silhouetteDict[0][i]))

    }, []);

    useEffect(function(){
        if(props.centroids[props.currentRun] !== undefined) {
            console.log(props.currentRun)
            let xScale = d3.scaleBand()
                .domain(d3.range(0, data.length))
                .range([0, w])
            let yScale = d3.scaleLinear()
                .domain([-1, 1])
                .range([h, 0]);
            const svg = d3.select("#silhouetteChart");
            const update = svg;
            update.select(".MyAxisX")
                .call(d3.axisBottom(xScale));

            d3.selectAll(".silhouette.bar")
                .remove()
                .exit()
                .data(data)
                .enter()
                .append('rect')
                .attr("class", "silhouette bar")
                .attr('x', (d, i) => xScale(i))
                .attr('width', xScale.bandwidth())
                .attr('y', (d, i, data) => yScale(silhouetteDict[props.currentRun].i))
                .attr('height', (d, i, data) => h - yScale(silhouetteDict[props.currentRun].i))

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
