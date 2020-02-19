import React, {useState} from 'react';
import {Backdrop, CircularProgress, Grid, Paper, Snackbar, Typography} from "@material-ui/core";
import CreteNewFolderIcon from '@material-ui/icons/CreateNewFolder';
import FolderIcon from '@material-ui/icons/Folder';
import {Alert, AlertTitle} from '@material-ui/lab'

import './DropFile.scss'


function parseFiles(files) {
    let datasetFile;
    const runFiles = [];

    for(const f of files) {
        if(! f.isFile) continue;
        if(f.name === "dataset.csv") datasetFile = f;
        else if(f.name.endsWith(".csv")) runFiles.push(f);
    }

    return {datasetFile, runFiles}
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
        let datasetFile, runFiles;

        if(e.dataTransfer.items.length > 1) {
            const files = [...e.dataTransfer.items].map(f => f.webkitGetAsEntry());
            ({datasetFile, runFiles} = parseFiles(files));
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
            ({datasetFile, runFiles} = parseFiles(files));
        }

        setDragging(false);
        if(datasetFile === undefined) uploadError("No dataset file!");
        else if(! runFiles || runFiles.length < 2) uploadError("Not enough run files!");
        else {
            props.onDroppedFiles(runFiles.length);
            datasetFile.file(props.datasetCallback);
            runFiles.forEach(runFile => runFile.file(props.runCallback));
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
