import React, { useState } from "react";
// import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import IconButton from "@mui/material/IconButton";
import "./style.css";

function VideoPreview({ videoRef }) {
  console.log("🚀 ~ VideoPreview ~ videoRef:", videoRef);
  const [hidden, toggleHidden] = useState(false);
  const [pos, setPos] = useState(80);
  const [size, setSize] = useState(200);
  const [full, toggleFull] = useState(false);
  function minimize() {
    toggleHidden(!hidden);
    setPos(pos === 10 ? -170 : 10);
  }
  function maximize() {
    if (full) {
      setSize("80%");
    } else {
      setSize(200);
    }
    toggleFull(!full);
  }
  return (
    <div
      style={{
        color: "#fff",
        textAlign: "right",
        background: "#e2e2e2",
        position: "absolute",
        boxShadow: "rgba(0, 0, 0, 0.15) 0px 3px 3px 0px",
        borderRadius: 5,
        transition: "ease-in 0.3s all",
        zIndex: 1100,
        width: size,
        height: size,
        right: pos,
        borderRadius: "30px",
      }}
      className="local-video-preview"
    >
      <video
        style={{ height: "200px", borderRadius: "30px" }}
        ref={videoRef}
        autoPlay
        playsInline
      />

      <IconButton
        onClick={maximize}
        size="small"
        style={{ position: "absolute", top: 2, right: 2, color: "#fff" }}
      >
        <FullscreenIcon />
      </IconButton>
      <IconButton
        onClick={minimize}
        size="small"
        style={{ position: "absolute", bottom: 2, left: 2, color: "#fff" }}
      >
        {pos === 10 ? <RemoveIcon /> : <AddIcon />}
      </IconButton>
    </div>
  );
}
export default VideoPreview;
