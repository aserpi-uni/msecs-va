import * as d3 from 'd3'
import React, {useEffect, useState} from "react";
import {UMAP} from "umap-js";
import {CircularProgress, Grid, Paper, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/styles";

import './Umap.scss'


function Umap(props) {
    const [datasetReduced, setDatasetReduced] = useState([]);
    const [epoch, setEpoch] = useState(-1);

    const classes = makeStyles({
        alignCenter: {
            margin: "auto"
        },

        backgroundLayer: {
            display: 'grid',
            height: props.height,
            width: props.width
        },

        backgroundPaper: {
            alignItems: 'center',
            display: 'grid',
            height: 3*props.height/5,
            justifyItems: 'center',
            margin: 0,
            width: props.width/2
        }
    })();

    function mergeClusters(datasetReduced) {
        for(let i = 0; i < datasetReduced.length; i++) {
            datasetReduced[i][2] = props.clusters[i];
        }
    }

    async function drawUmap() {
        const datasetReducedTemp = await new UMAP({
            distanceFn: props.distance,
            minDist: props.minDist,
            nNeighbors: props.nNeighbors})
          .fitAsync(props.dataset, setEpoch);
        if(props.clusters !== undefined) mergeClusters(datasetReducedTemp);
        setDatasetReduced(datasetReducedTemp);
        setEpoch(-1);

        const svg = d3.select('#umapChart'),
          h = props.height,
          w = props.width;

        const xScale = d3.scaleLinear()
          .domain([d3.min(datasetReducedTemp, v => v[0]), d3.max(datasetReducedTemp, v => v[0])])
          .range([0, w]);

        const yScale = d3.scaleLinear()
          .domain([d3.min(datasetReducedTemp, v => v[1]), d3.max(datasetReducedTemp, v => v[1])])
          .range([h, 0]);

        svg.append("g")
          .attr("class", "umap axis x")
          .attr("transform", `translate(0, ${h})`)
          .call(d3.axisBottom(xScale));

        svg.append("g")
          .attr("class", "umap axis y")
          .call(d3.axisLeft(yScale));

        svg.selectAll(".umap.dot")
          .data(datasetReducedTemp)
          .enter().append("circle")
          .attr("class", "umap dot")
          .attr("cx", d => xScale(d[0]))
          .attr("cy", d => yScale(d[1]))
          .attr("r", 2)
          .style("fill", d => d.length > 2 ? props.colorScale(d[2]) : undefined);
    }

    useEffect(function() {
        if(props.clusters === undefined) return;
        mergeClusters(datasetReduced);

        d3.selectAll(".umap.dot")
          .transition(d3.transition().duration(750))
          .style("fill", d => props.colorScale(d[2]))
    }, [props.clusters]);

    useEffect( function() {
        if(props.dataset === undefined) return;
        drawUmap();
    }, [props.minDist, props.nNeighbors]);

    // TODO: improve loading card
    function renderLoadingCard() {
        return (
            <foreignObject height={props.height} width={props.width}
                           transform={`translate(${props.margin.x},${props.margin.y})`}>
                <Grid className={classes.backgroundLayer} alignItems='center' justify='center'>
                    <Paper className={classes.backgroundPaper}>
                        <CircularProgress/>
                        <Typography variant='h5'>
                            Epoch {epoch}
                        </Typography>
                    </Paper>
                </Grid>
            </foreignObject>
        )
    }

    if(epoch >= 0) return renderLoadingCard();
    return (
      <g id="umapChart" className="umap chart"
         height={props.height} width={props.width}
         transform={`translate(${props.margin.x},${props.margin.y})`}/>
    );
}


export default Umap
