import React, { useState, useRef } from "react";
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
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 10, y: 10 });
  const dragItemRef = useRef(null);
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

  // const dragItemRef = useRef(null);

  const startDrag = (clientX, clientY) => {
    dragItemRef.current = {
      offsetX: clientX - position.x,
      offsetY: clientY - position.y,
    };
  };

  const onDrag = (clientX, clientY) => {
    if (dragItemRef.current) {
      const newX = clientX - dragItemRef.current.offsetX;
      const newY = clientY - dragItemRef.current.offsetY;
      setPosition({ x: newX, y: newY });
    }
  };

  const endDrag = () => {
    dragItemRef.current = null;
  };

  const handleMouseDown = (e) => {
    startDrag(e.clientX, e.clientY);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    e.preventDefault();
    if (e.buttons === 1) {
      // Check if the primary button is pressed
      onDrag(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    endDrag();
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    onDrag(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    endDrag();
  };
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
        bottom: `${position.y}px`,
        right: `${position.x}px`,
      }}
      // onMouseDown={handleMouseDown}
      // onMouseMove={handleMouseMove}
      // onMouseUp={handleMouseUp}
      // onMouseLeave={handleMouseUp} // Optional: stop dragging if the mouse leaves the component
      // onTouchStart={handleTouchStart}
      // onTouchMove={handleTouchMove}
      // onTouchEnd={handleTouchEnd}
      className="local-video-preview"
    >
      <video
        style={{ height: "200px", borderRadius: "30px" }}
        ref={videoRef}
        autoPlay
        playsInline
        muted
      />

      <IconButton
        onClick={maximize}
        size="small"
        style={{ position: "absolute", top: 2, right: 2, color: "#fff" }}
      >
        {/* <FullscreenIcon /> */}
      </IconButton>
      <IconButton
        onClick={minimize}
        size="small"
        style={{ position: "absolute", bottom: 2, left: 2, color: "#fff" }}
      >
        {pos === 80 ? <RemoveIcon /> : <AddIcon />}
      </IconButton>
    </div>
  );
}
export default VideoPreview;
