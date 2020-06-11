import * as d3 from 'd3';
import d3tip from 'd3-tip'
import {Button, Drawer, Grid, Input, Slider, Typography} from "@material-ui/core";
import SettingsIcon from "@material-ui/icons/Settings";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import SaveIcon from '@material-ui/icons/Save';
import React, {useEffect, useState} from "react";

import './Elbow.scss'
import {initElbow} from "./utils";


function Elbow(props) {
    const [fScore, setFScore] = useState();
    const [metric, setMetric] = useState();
    const [metricTemp, setMetricTemp] = useState();
    const [openSettings, setOpenSettings] = useState(false);
    const [currentRun, setCurrentRun] = useState();
    const [sse, setSse] = useState();

    function onDotClick(d, i, c) {
        const dotClicked = d3.select(this);
        if(dotClicked.classed("selected")) return;

        d3.selectAll(c).classed("selected", false);
        dotClicked.classed("selected", true);

        setCurrentRun(d.k);
        if(props.onRunChange !== undefined) props.onRunChange(d.k);
    }

    function onMetricChange(e, v) {
        setMetricTemp(v);
    }

    function onSaveClicked() {
        setMetric(metricTemp);
        setOpenSettings(false);
    }

    function onSettingsClose() {
        setMetricTemp(metric);
        setOpenSettings(false);
    }

    function renderElbow() {
        const svg = d3.select("#elbowChart"),
          h = props.height,
          w = props.width,
          metrics = [];

        svg.selectAll(".elbow.axis:not(.label)").remove();
        svg.selectAll(".elbow.dot-k").remove();
        svg.selectAll(".elbow.line").remove();

        for(let k of Object.keys(props.labels)) {
            k = +k;
            metrics.push({
                k: k,
                metric: metric === "fScore" ? fScore[k] : sse[k]
            })
        }

        const xScale = d3.scaleLinear()
          .domain([d3.min(metrics, v => v.k) -1, d3.max(metrics, v => v.k) + 1])
          .range([0, w]);

        const yScale = d3.scaleLinear()
          .domain([d3.min(metrics, v => v.metric) * 0.9, d3.max(metrics, v => v.metric) * 1.1])
          .range([h, 0]);

        // See https://github.com/d3/d3-shape/blob/master/README.md#curveMonotoneX
        const line = d3.line()
          .x(d => xScale(d.k))
          .y(d => yScale(d.metric))
          .curve(d3.curveMonotoneX);

        svg.append("path")
          .datum(metrics)
          .attr("class", "elbow line")
          .attr("d", line);

        svg.append("g")
          .attr("class", "elbow axis x")
          .attr("transform", `translate(0, ${h})`)
          .call(d3.axisBottom(xScale));

        svg.append("g")
          .attr("class", "elbow axis y")
          .call(d3.axisLeft(yScale));

        const tip = d3tip()
          .attr("class", "elbow tooltip")
          .html(k => `Clusters: <strong>${k.k}</strong><br>${metric === "fScore" ? "F-score" : "SSE"}: <strong>${k.metric}</strong>`)
          .offset([-10, 0]);
        svg.call(tip);

        svg.selectAll(".elbow.dot-k")
          .data(metrics)
          .enter().append("circle")
            .attr("class", "elbow dot-k")
            .attr("cx", d => xScale(d.k))
            .attr("cy", d => yScale(d.metric))
            .attr("r", 5)
            .classed("selected", d => d.k == currentRun)
            .on("mouseover", tip.show)
            .on("mouseout", tip.hide)

        renderPointers();
    }

    function renderPointers() {
        const dots = d3.selectAll(".elbow.dot-k");

        if(props.busy) {
            dots
                .style("cursor", "no-drop")
                .on("click", undefined)
        } else {
            dots
                .style("cursor", "pointer")
                .on("click",  onDotClick)
        }
    }

    function renderSettingsDrawer() {
        return (
            <Drawer anchor="bottom" open={openSettings} onClose={onSettingsClose}>
                <Grid container className="elbow settings container" alignItems="center">
                    <Typography variant="h5" className="elbow settings min-dist header">
                        Metric
                    </Typography>

                    <RadioGroup row className="elbow settings metric" defaultValue={metric} onChange={onMetricChange}>
                        <FormControlLabel
                            value="fScore"
                            control={<Radio color="primary" />}
                            label="F-score"
                            labelPlacement="end" />

                        <FormControlLabel
                            value="sse"
                            control={<Radio color="primary" />}
                            label="SSE"
                            labelPlacement="end" />
                    </RadioGroup>

                    <Button className="elbow settings save" variant="contained" size="large" startIcon={<SaveIcon/>}
                            onClick={onSaveClicked}>
                        Save
                    </Button>
                </Grid>
            </Drawer>
        )
    }

    useEffect(function() {
        const [sseTemp, fScoreTemp] = initElbow(props.dataset, props.labels);
        setFScore(fScoreTemp);
        setSse(sseTemp);
        setMetric("sse");

        d3.select("#elbowSettingsIcon")
            .on("click", () => setOpenSettings(true));
    }, []);

    useEffect(function () {
        if(metric === undefined) {
            return
        }
        renderElbow();
    }, [metric])

    useEffect(function() {
        renderPointers();
    }, [props.busy]);

    return (
      <svg id="baseElbowChart" className="elbow chart"
           height={props.height + 2*props.padding.y} width={props.width + 2*props.padding.x}>
          <g id="elbowChart" className="elbow chart"
             height={props.height} width={props.width}
             transform={`translate(${props.padding.x},${props.padding.y})`}>
              <text className="elbow axis label x"
                    transform={`translate(${props.width/2},${props.height+3*props.padding.y/4})`}>
                  Number of clusters
              </text>

              <text className="elbow axis label y"
                    transform={`translate(-${2*props.padding.x/3},${props.height/2}),rotate(-90)`}>
                  { metric === "fScore" ? "F-score" : "Sum of squared errors" }
              </text>

              <foreignObject height={props.height} width={props.padding.x}
                             transform={`translate(${props.width},0)`}>
                  <Grid container className="elbow toolbar" alignItems="center">
                      <Grid item>
                          <SettingsIcon id="elbowSettingsIcon" className="elbow settings icon"
                                        fontSize="small"/>
                      </Grid>
                  </Grid>

                  { renderSettingsDrawer() }
              </foreignObject>
          </g>
      </svg>
    )
}


export default Elbow
