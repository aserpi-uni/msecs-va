import * as d3 from 'd3'
import React, {useEffect, useState} from "react";
import {UMAP} from "umap-js";
import {CircularProgress, Grid, Paper, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/styles";

import './Umap.scss'


function Umap(props) {
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

    useEffect( function() {
        if(props.dataset === undefined) return;

        async function reduceDataset() {
            const datasetReduced = await new UMAP({
                distanceFn: props.distance,
                minDist: props.minDist,
                nNeighbors: props.nNeighbors})
              .fitAsync(props.dataset, setEpoch);
            setEpoch(-1);

            const svg = d3.select('#umapChart'),
              h = props.height,
              w = props.width;

            const xScale = d3.scaleLinear()
              .domain([d3.min(datasetReduced, v => v[0]), d3.max(datasetReduced, v => v[0])])
              .range([0, w]);

            const yScale = d3.scaleLinear()
              .domain([d3.min(datasetReduced, v => v[1]), d3.max(datasetReduced, v => v[1])])
              .range([h, 0]);

            svg.append("g")
              .attr("class", "umap axis x")
              .attr("transform", `translate(0, ${h})`)
              .call(d3.axisBottom(xScale));

            svg.append("g")
              .attr("class", "umap axis y")
              .call(d3.axisLeft(yScale));

            svg.selectAll(".umap.dot")
              .data(datasetReduced)
              .enter().append("circle")
                .attr("class", "umap dot")
                .attr("cx", d => xScale(d[0]))
                .attr("cy", d => yScale(d[1]))
                .attr("r", 2)
                .style("fill", d => d.length > 2 ? props.colorScale(d[2]) : undefined);
        }

        reduceDataset();
    }, [props.dataset, props.minDist, props.nNeighbors]);

    // TODO: improve loading card
    function renderLoadingCard() {
        return (
            <foreignObject width={props.width} height={props.height}
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
         width={props.width} height={props.height}
         transform={`translate(${props.margin.x},${props.margin.y})`}/>
    );
}

export default Umap
