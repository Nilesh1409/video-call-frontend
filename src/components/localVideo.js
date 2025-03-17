import { useState, useEffect, useRef } from "react";
import {
  IconButton,
  Box,
  Paper,
  Tooltip,
  useMediaQuery,
  alpha,
} from "@mui/material";
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  Cameraswitch as CameraswitchIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  DragIndicator as DragIndicatorIcon,
} from "@mui/icons-material";

const LocalVideo = ({
  videoRef,
  toggleMute,
  toggleVideo,
  switchCamera,
  isMuted,
  isVideoOff,
  position,
  setPosition,
}) => {
  const [size, setSize] = useState(200);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Responsive breakpoints
  const isMobile = useMediaQuery("(max-width:600px)");
  const defaultSize = isMobile ? 150 : 200;
  const maxSize = isMobile ? 300 : 500;

  // Initialize size
  useEffect(() => {
    setSize(defaultSize);
  }, [defaultSize]);

  // Set default position if not already set
  useEffect(() => {
    if (position.x === null && position.y === null) {
      setPosition({
        x: window.innerWidth - size - 20,
        y: window.innerHeight - size - 20,
      });
    }
  }, [size]);

  // Increase video preview size
  const increaseSize = () => {
    setSize((prev) => Math.min(prev + 50, maxSize));
  };

  // Decrease video preview size
  const decreaseSize = () => {
    setSize((prev) => Math.max(prev - 50, 100));
  };

  // Handle drag start
  const handleMouseDown = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  // Handle touch start for mobile
  const handleTouchStart = (e) => {
    if (containerRef.current && e.touches[0]) {
      const rect = containerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  // Handle drag move
  const handleMouseMove = (e) => {
    if (isDragging && containerRef.current) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Get window dimensions
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Constrain to window boundaries
      const constrainedX = Math.max(0, Math.min(newX, windowWidth - size));
      const constrainedY = Math.max(0, Math.min(newY, windowHeight - size));

      setPosition({ x: constrainedX, y: constrainedY });
    }
  };

  // Handle touch move for mobile
  const handleTouchMove = (e) => {
    if (isDragging && containerRef.current && e.touches[0]) {
      const newX = e.touches[0].clientX - dragOffset.x;
      const newY = e.touches[0].clientY - dragOffset.y;

      // Get window dimensions
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Constrain to window boundaries
      const constrainedX = Math.max(0, Math.min(newX, windowWidth - size));
      const constrainedY = Math.max(0, Math.min(newY, windowHeight - size));

      setPosition({ x: constrainedX, y: constrainedY });

      // Prevent scrolling while dragging
      e.preventDefault();
    }
  };

  // Handle drag end
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global event listeners for drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <Paper
      ref={containerRef}
      elevation={0}
      sx={{
        position: "fixed",
        width: size,
        height: size,
        right: position.x !== null ? "auto" : 20,
        bottom: position.y !== null ? "auto" : 20,
        left: position.x !== null ? position.x : "auto",
        top: position.y !== null ? position.y : "auto",
        borderRadius: "24px",
        overflow: "hidden",
        transition: "all 0.3s ease",
        zIndex: 1100,
        cursor: isDragging ? "grabbing" : "grab",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
        backdropFilter: "blur(10px)",
        backgroundColor: alpha("#111827", 0.6),
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          borderRadius: "24px",
          padding: "2px",
          background:
            "linear-gradient(45deg, rgba(108, 99, 255, 0.5), rgba(0, 229, 255, 0.5))",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          pointerEvents: "none",
          zIndex: 2,
        },
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Drag handle indicator */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "28px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: alpha("#000", 0.5),
          color: "white",
          zIndex: 1,
          backdropFilter: "blur(5px)",
        }}
      >
        <DragIndicatorIcon fontSize="small" />
      </Box>

      {/* Local video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "22px",
        }}
      />

      {/* Controls overlay */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: 1.5,
          display: "flex",
          justifyContent: "space-between",
          backgroundColor: alpha("#000", 0.5),
          borderBottomLeftRadius: "22px",
          borderBottomRightRadius: "22px",
          backdropFilter: "blur(8px)",
          transition: "all 0.3s ease",
        }}
      >
        <Box sx={{ display: "flex", gap: 0.8 }}>
          <Tooltip title={isMuted ? "Unmute" : "Mute"}>
            <IconButton
              onClick={toggleMute}
              size="small"
              sx={{
                color: isMuted ? "#FF5252" : "white",
                "&:hover": {
                  backgroundColor: alpha("#fff", 0.1),
                  transform: "scale(1.1)",
                },
                transition: "all 0.2s ease",
              }}
            >
              {isMuted ? (
                <MicOffIcon fontSize="small" />
              ) : (
                <MicIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title={isVideoOff ? "Turn on camera" : "Turn off camera"}>
            <IconButton
              onClick={toggleVideo}
              size="small"
              sx={{
                color: isVideoOff ? "#FF5252" : "white",
                "&:hover": {
                  backgroundColor: alpha("#fff", 0.1),
                  transform: "scale(1.1)",
                },
                transition: "all 0.2s ease",
              }}
            >
              {isVideoOff ? (
                <VideocamOffIcon fontSize="small" />
              ) : (
                <VideocamIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title="Switch camera">
            <IconButton
              onClick={switchCamera}
              size="small"
              sx={{
                color: "white",
                "&:hover": {
                  backgroundColor: alpha("#fff", 0.1),
                  transform: "scale(1.1)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <CameraswitchIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ display: "flex", gap: 0.8 }}>
          <Tooltip title="Decrease size">
            <IconButton
              onClick={decreaseSize}
              size="small"
              sx={{
                color: "white",
                "&:hover": {
                  backgroundColor: alpha("#fff", 0.1),
                  transform: "scale(1.1)",
                },
                transition: "all 0.2s ease",
                opacity: size <= 100 ? 0.5 : 1,
              }}
              disabled={size <= 100}
            >
              <ZoomOutIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Increase size">
            <IconButton
              onClick={increaseSize}
              size="small"
              sx={{
                color: "white",
                "&:hover": {
                  backgroundColor: alpha("#fff", 0.1),
                  transform: "scale(1.1)",
                },
                transition: "all 0.2s ease",
                opacity: size >= maxSize ? 0.5 : 1,
              }}
              disabled={size >= maxSize}
            >
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Paper>
  );
};

export default LocalVideo;
