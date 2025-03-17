import { useState, useRef, useEffect } from "react";
import {
  IconButton,
  Box,
  Typography,
  Fade,
  useMediaQuery,
  alpha,
  Tooltip,
} from "@mui/material";
import {
  CallEnd as CallEndIcon,
  VolumeOff as VolumeOffIcon,
  VolumeUp as VolumeUpIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  MoreVert as MoreVertIcon,
  ScreenShare as ScreenShareIcon,
  StopScreenShare as StopScreenShareIcon,
} from "@mui/icons-material";

const RemoteVideo = ({
  videoRef,
  leaveCall,
  callEnded,
  toggleScreenShare,
  isScreenSharing,
}) => {
  const [isRemoteMuted, setIsRemoteMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [remoteUserName, setRemoteUserName] = useState("");
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Responsive breakpoints
  const isMobile = useMediaQuery("(max-width:600px)");

  // Toggle mute for remote video
  const toggleRemoteMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsRemoteMuted(!isRemoteMuted);
    }
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  // Show controls when mouse moves
  const handleMouseMove = () => {
    setIsControlsVisible(true);

    // Clear existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    // Set new timeout to hide controls
    controlsTimeoutRef.current = setTimeout(() => {
      setIsControlsVisible(false);
    }, 3000);
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.msFullscreenElement
      );
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    // Initial controls timeout
    handleMouseMove();

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange
      );

      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Get remote user's name from video track if available
  useEffect(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const videoTrack = videoRef.current.srcObject.getVideoTracks()[0];
      if (videoTrack && videoTrack.label) {
        setRemoteUserName(videoTrack.label);
      }
    }
  }, [videoRef]);

  return (
    <Box
      ref={containerRef}
      className="remote-video-container"
      sx={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        bgcolor: "#000",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at center, rgba(108, 99, 255, 0.1) 0%, rgba(0, 0, 0, 0.5) 100%)",
          pointerEvents: "none",
          zIndex: 1,
        },
      }}
      onMouseMove={handleMouseMove}
      onTouchStart={handleMouseMove}
    >
      {/* Remote Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          backgroundColor: "#000",
        }}
      />

      {/* Top overlay - user info */}
      <Fade in={isControlsVisible}>
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            padding: 3,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)",
            display: "flex",
            alignItems: "center",
            zIndex: 10,
            backdropFilter: "blur(10px)",
          }}
        >
          <Typography
            variant="h5"
            color="white"
            sx={{
              fontWeight: 600,
              textShadow: "0 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            {remoteUserName || "Remote User"}
          </Typography>
        </Box>
      </Fade>

      {/* Bottom overlay - controls */}
      <Fade in={isControlsVisible}>
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: 3,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
            zIndex: 10,
            backdropFilter: "blur(10px)",
          }}
        >
          {/* End Call Button */}
          <IconButton
            onClick={() => {
              leaveCall();
            }}
            sx={{
              bgcolor: "rgba(255, 82, 82, 0.9)",
              color: "white",
              "&:hover": {
                bgcolor: "rgba(255, 82, 82, 1)",
                transform: "scale(1.1)",
              },
              width: isMobile ? 56 : 64,
              height: isMobile ? 56 : 64,
              transition: "all 0.2s ease",
              boxShadow: "0 4px 20px rgba(255, 82, 82, 0.5)",
            }}
          >
            <CallEndIcon fontSize={isMobile ? "medium" : "large"} />
          </IconButton>

          {/* Mute Remote Button */}
          <Tooltip title={isRemoteMuted ? "Unmute" : "Mute"}>
            <IconButton
              onClick={toggleRemoteMute}
              sx={{
                bgcolor: alpha("#000", 0.6),
                color: "white",
                "&:hover": {
                  bgcolor: alpha("#000", 0.8),
                  transform: "scale(1.1)",
                },
                width: isMobile ? 48 : 56,
                height: isMobile ? 48 : 56,
                transition: "all 0.2s ease",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
              }}
            >
              {isRemoteMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </IconButton>
          </Tooltip>

          {/* Screen Share Button */}
          <Tooltip title={isScreenSharing ? "Stop sharing" : "Share screen"}>
            <IconButton
              onClick={toggleScreenShare}
              sx={{
                bgcolor: isScreenSharing
                  ? alpha("#00E5FF", 0.3)
                  : alpha("#000", 0.6),
                color: "white",
                "&:hover": {
                  bgcolor: isScreenSharing
                    ? alpha("#00E5FF", 0.5)
                    : alpha("#000", 0.8),
                  transform: "scale(1.1)",
                },
                width: isMobile ? 48 : 56,
                height: isMobile ? 48 : 56,
                transition: "all 0.2s ease",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
              }}
            >
              {isScreenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
            </IconButton>
          </Tooltip>

          {/* Fullscreen Button */}
          <Tooltip title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
            <IconButton
              onClick={toggleFullscreen}
              sx={{
                bgcolor: alpha("#000", 0.6),
                color: "white",
                "&:hover": {
                  bgcolor: alpha("#000", 0.8),
                  transform: "scale(1.1)",
                },
                width: isMobile ? 48 : 56,
                height: isMobile ? 48 : 56,
                transition: "all 0.2s ease",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
              }}
            >
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Fade>
    </Box>
  );
};

export default RemoteVideo;
