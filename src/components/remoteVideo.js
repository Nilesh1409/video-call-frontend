import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import CallIcon from "@mui/icons-material/Call";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import classes from "./style.css";

const RemoteVideo = ({ videoRef, leaveCall, callEnded }) => {
  const [muted, toggleMuted] = useState(false);
  const [camOff, toggleCamOff] = useState(false);
  return (
    <div className={"container"}>
      <Paper elevation={1} square>
        <Grid
          container
          direction="column"
          justify="center"
          alignItems="center"
          spacing={1}
          className={classes.mainGrid}
        >
          <Grid
            container
            item
            xs={12}
            position="relative"
            justify="center"
            alignItems="center"
          >
            <video
              style={{ height: "90vh", width: "100vw" }}
              ref={videoRef}
              autoPlay
              playsInline
            />
            <Button
              variant="contained"
              style={{
                borderRadius: 50,
                color: "#000",
                backgroundColor: "#CA0B00",
                position: "absolute",
                bottom: 10,
                left: "48%",
              }}
              onClick={() => {
                leaveCall();
                window.location.reload();
              }}
            >
              <CallIcon />
            </Button>
          </Grid>
          <Grid
            container
            item
            direction="row"
            xs={12}
            justify="center"
            alignItems="center"
          >
            {/* <Button
              onClick={() => toggleMuted(!muted)}
              variant="contained"
              // color="white"
              style={{
                borderRadius: 50,
                marginRight: 25,
                backgroundColor: "#000",
              }}
            >
              {muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </Button> */}
            {/* <Button
              variant="contained"
              style={{
                borderRadius: 50,
                color: "#000",
                backgroundColor: "#CA0B00",
              }}
              onClick={() => {
                leaveCall();
                window.location.reload();
              }}
            >
              <CallIcon />
            </Button> */}
            {/* <Button
              onClick={() => toggleCamOff(!camOff)}
              variant="contained"
              // color="white"
              style={{
                borderRadius: 50,
                marginLeft: 25,
                backgroundColor: "#000",
              }}
            >
              {camOff ? <VideocamOffIcon /> : <VideocamIcon />}
            </Button> */}
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};

// export default withStyles(styles)(RemoteVideo);
export default RemoteVideo;
