import * as d3 from 'd3'
import React, {useEffect, useState} from "react";
import {UMAP} from "umap-js";
import {CircularProgress, Grid, Paper, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/styles";


function Umap(props) {
    const [epoch, setEpoch] = useState(-1);

    const classes = makeStyles({
        alignCenter: {
            margin: "auto"
        },

        backgroundLayer: {
            height: props.height,
            width: props.width
        },

        backgroundPaper: {
            height: 3*props.height/5,
            margin: 0,
            width: props.width/2
        }
    })();

    useEffect( function() {
        if(props.dataset === undefined) return;

        async function reduceDataset() {
            const datasetReduced = await new UMAP({
                nComponents: props.nComponents,
                nNeighbors: props.nNeighbors,
                minDist: props.minDist,
                spread: props.spread})
              .fitAsync(props.dataset, setEpoch
              );

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
              .attr("r", 1)
              .style("fill", props.colorScale);

            setEpoch(-1);
        }

        reduceDataset();
    }, [props.dataset,
        props.height,
        props.width,
        props.nComponents,
        props.nNeighbors,
        props.minDist,
        props.spread,
        props.colorScale
    ]);

    // TODO: improve loading card
    return (
      <g>
          <g id="umapChart" className="umap chart"
             width={props.width} height={props.height}
             transform={`translate(${props.margin.x},${props.margin.y})`}/>
          {
              epoch >= 0 &&
              <g>
                <foreignObject width={props.width} height={props.height}
                               transform={`translate(${props.margin.x},${props.margin.y})`}>
                    <Grid container className={classes.backgroundLayer} justify={"center"} alignItems={"center"}>
                        <Grid item>
                            <Paper className={classes.backgroundPaper}>
                                <Grid container className={classes.backgroundPaper} spacing={0}
                                      alignItems={"center"} justify={"center"}>
                                    <Grid item xs={12}>
                                        <CircularProgress/>
                                    </Grid>
                                    <Grid>
                                        <Typography xs={12}>
                                            Epoch {epoch}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                    </Grid>
                </foreignObject>
            </g>
          }
      </g>
    )
}

export default Umap
