import * as d3 from 'd3'
import {Backdrop, CircularProgress, Grid, Paper, Snackbar, Typography} from "@material-ui/core";
import CreteNewFolderIcon from '@material-ui/icons/CreateNewFolder';
import FolderIcon from '@material-ui/icons/Folder';
import {Alert, AlertTitle} from '@material-ui/lab'
import React, {useState} from 'react';

import './DropFile.scss'
import {init, parseDatasetElement} from "./utils";


async function convertFilePromise(webkitEntry) {
    return new Promise(resolve => webkitEntry.file(resolve))
}


function selectFiles(files) {
    let configurationFile, datasetFile;
    const runFiles = [];

    for(const f of files) {
        if(! f.isFile) continue;
        if(f.name === "dataset.csv") datasetFile = f;
        else if(f.name === "dataset.json") configurationFile = f;
        else if(f.name.endsWith(".csv")) runFiles.push(f);
    }

    return {configurationFile, datasetFile, runFiles}
}


// Wrap readEntries in a promise to make working with readEntries easier
// readEntries will return only some of the entries in a directory
// e.g. Chrome returns at most 100 entries at a time
async function readEntriesPromise(directoryReader) {
    try {
        // return-await is not redundant because it is in a try-catch block
        return await new Promise((resolve, reject) => {
            directoryReader.readEntries(resolve, reject);
        });
    } catch (err) {
        console.log(err);
    }
}


function DropFiles(props){
    const [backdrop, setBackdrop] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [snackbar, setSnackbar] = useState(false);

    async function onDrag(e) {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
    }

    async function onDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        setBackdrop(true);
        let configurationFile, datasetFile, runFiles;

        if(e.dataTransfer.items.length > 1) {
            const files = [...e.dataTransfer.items].map(f => f.webkitGetAsEntry());
            ({configurationFile, datasetFile, runFiles} = selectFiles(files));
        }

        else {
            const directory = e.dataTransfer.items[0].webkitGetAsEntry();
            if(! directory.isDirectory) {
                uploadError("The file is not a directory!");
                return;
            }

            const directoryReader = directory.createReader(),
              files = [];
            let readEntries = await readEntriesPromise(directoryReader);
            while (readEntries.length > 0) {
                files.push(...readEntries);
                readEntries = await readEntriesPromise(directoryReader);
            }
            ({configurationFile, datasetFile, runFiles} = selectFiles(files));
        }

        setDragging(false);
        if(configurationFile === undefined) uploadError("No configuration file");
        else if(datasetFile === undefined) uploadError("No dataset file!");
        else if(! runFiles || runFiles.length < 2) uploadError("Not enough run files!");
        else parseFiles(configurationFile, datasetFile, runFiles);
    }

    async function parseFiles(configurationFile, datasetFile, runFiles) {
        // File promises
        let centroidPromises = {},
          configurationPromise = convertFilePromise(configurationFile),
          datasetPromise = convertFilePromise(datasetFile),
          labelPromises = {};
        for(let f of runFiles) {
            const m = f.name.match(/^(centroids|labels)_(\d+).csv$/);
            if(m && m[1] === "centroids") centroidPromises[m[2]] = convertFilePromise(f);
            else if(m && m[1] === "labels") labelPromises[m[2]] = convertFilePromise(f)
        }

        // String promises
        configurationPromise = (await configurationPromise).text();
        datasetPromise = (await datasetPromise).text();
        const completeRuns = [];
        for(const k of Object.keys(centroidPromises)) {
            // Take only runs that have both centroids and labels
            if(labelPromises[k] === undefined) continue;
            completeRuns.push(k);
            centroidPromises[k] = (await centroidPromises[k]).text();
            labelPromises[k] = (await labelPromises[k]).text()
        }

        // Text parsing
        const config = JSON.parse(await configurationPromise);
        if(! config.gamma) uploadError("No gamma in configuration file!");
        else if(! config.categoricalFeatures) uploadError("No categorical features specified!");
        else if(! config.numericalFeatures) uploadError("No numerical features specified!");
        else {
            init(config.categoricalFeatures, config.numericalFeatures, config.gamma);
            const centroids = {},
              labels = {};
            for(const k of completeRuns) {
                centroids[k] = d3.csvParse(await centroidPromises[k], parseDatasetElement);
                labels[k] = d3.csvParseRows(await labelPromises[k], d => +d)
            }
            const dataset = d3.csvParse(await datasetPromise, parseDatasetElement);

            props.callback(config, dataset, centroids, labels)
        }
    }

    function uploadError(msg) {
        setBackdrop(false);
        setErrorMessage(msg);
        setSnackbar(true);
    }

    function folderIcon() {
        if(dragging) return <CreteNewFolderIcon className="drop-files folder-icon"/>;
        else return <FolderIcon className="drop-files folder-icon"/>
    }

    return (
      <Grid container className="drop-files parametric-dimensions" alignItems="center" justify="center"
            style={{height: props.height, width: props.width}}>
          <Paper className="drop-files background-paper">
              <Grid container className="drop-files background-paper"
                    alignItems="center" direction="column" justify="center">
                  <Grid item>
                      <Typography variant="h3">
                          Drop your files on this box
                      </Typography>
                  </Grid>

                  <Grid item>
                      <Paper className="drop-files foreground-paper"
                             onDragOver={onDrag} onDrop={onDrop}>
                          { folderIcon() }
                      </Paper>
                  </Grid>
              </Grid>
          </Paper>

          <Backdrop className="drop-files backdrop" open={backdrop}>
              <CircularProgress/>
          </Backdrop>

          <Snackbar anchorOrigin={{ horizontal: "center", vertical: "top" }} autoHideDuration={6000}
                    onClose={() => setSnackbar(false)} open={snackbar}>
              <Alert severity="error">
                  <AlertTitle>
                      Error
                  </AlertTitle>

                  {errorMessage}
              </Alert>
          </Snackbar>
      </Grid>
    )
}


export default DropFiles
