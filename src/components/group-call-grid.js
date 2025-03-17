"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Avatar,
  useMediaQuery,
  alpha,
} from "@mui/material";
import {
  MicOff as MicOffIcon,
  VideocamOff as VideocamOffIcon,
  ScreenShare as ScreenShareIcon,
} from "@mui/icons-material";

const GroupCallGrid = ({
  peers,
  localStream,
  localVideoRef,
  userName,
  roomParticipants,
}) => {
  const [gridLayout, setGridLayout] = useState({ cols: 2, rows: 2 });
  const videoRefs = useRef({});

  // Responsive breakpoints
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:960px)");

  // Calculate grid layout based on number of participants
  useEffect(() => {
    const totalParticipants = roomParticipants.length;

    if (totalParticipants <= 1) {
      setGridLayout({ cols: 1, rows: 1 });
    } else if (totalParticipants <= 4) {
      setGridLayout({ cols: 2, rows: 2 });
    } else if (totalParticipants <= 9) {
      setGridLayout({ cols: 3, rows: 3 });
    } else {
      setGridLayout({ cols: 4, rows: 4 });
    }
  }, [roomParticipants.length]);

  // Set up video refs for peers
  useEffect(() => {
    Object.entries(peers).forEach(([userId, peerData]) => {
      if (peerData.stream && videoRefs.current[userId]) {
        videoRefs.current[userId].srcObject = peerData.stream;
      }
    });
  }, [peers]);

  // Generate random avatar color
  const getRandomColor = (index) => {
    const colors = [
      "linear-gradient(135deg, #6C63FF 0%, #4A43CB 100%)",
      "linear-gradient(135deg, #00E5FF 0%, #00B2CC 100%)",
      "linear-gradient(135deg, #FF5252 0%, #D32F2F 100%)",
      "linear-gradient(135deg, #4ADE80 0%, #22C55E 100%)",
      "linear-gradient(135deg, #FB7185 0%, #E11D48 100%)",
      "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)",
      "linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)",
      "linear-gradient(135deg, #F472B6 0%, #DB2777 100%)",
      "linear-gradient(135deg, #FBBF24 0%, #D97706 100%)",
      "linear-gradient(135deg, #34D399 0%, #059669 100%)",
    ];
    return colors[index % colors.length];
  };

  // Create video element for a participant
  const renderParticipantVideo = (participantId, index) => {
    const isLocal = participantId === userName;
    const hasVideo = isLocal
      ? localStream?.getVideoTracks().length > 0 &&
        localStream?.getVideoTracks()[0].enabled
      : peers[participantId]?.stream?.getVideoTracks().length > 0;
    const hasAudio = isLocal
      ? localStream?.getAudioTracks().length > 0 &&
        localStream?.getAudioTracks()[0].enabled
      : peers[participantId]?.stream?.getAudioTracks().length > 0;
    const isScreenSharing = isLocal
      ? false
      : peers[participantId]?.stream?.getVideoTracks().length > 0 &&
        peers[participantId]?.stream
          ?.getVideoTracks()[0]
          .label.includes("screen");

    return (
      <Grid item xs={12 / gridLayout.cols} key={participantId}>
        <Paper
          elevation={0}
          sx={{
            position: "relative",
            height: `calc(100vh / ${gridLayout.rows + 0.5})`,
            maxHeight: "calc(100vh - 180px)",
            borderRadius: "16px",
            overflow: "hidden",
            backgroundColor: alpha("#111827", 0.6),
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              transform: "scale(1.02)",
              zIndex: 1,
            },
          }}
        >
          {/* Video element */}
          {hasVideo ? (
            <video
              ref={(el) => {
                if (isLocal) {
                  // Local video already has a ref
                } else {
                  videoRefs.current[participantId] = el;
                }
              }}
              autoPlay
              playsInline
              muted={isLocal}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "14px",
                backgroundColor: "#111827",
              }}
            />
          ) : (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#111827",
                borderRadius: "14px",
              }}
            >
              <Avatar
                sx={{
                  width: "100px",
                  height: "100px",
                  background: getRandomColor(index),
                  fontSize: "3rem",
                  fontWeight: 700,
                }}
              >
                {participantId.charAt(0).toUpperCase()}
              </Avatar>
            </Box>
          )}

          {/* Participant info overlay */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: 1.5,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              zIndex: 1,
              backdropFilter: "blur(5px)",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                color: "white",
                fontWeight: 600,
                textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {participantId} {isLocal && "(You)"}
              {isScreenSharing && (
                <ScreenShareIcon
                  fontSize="small"
                  sx={{ ml: 1, color: "#00E5FF" }}
                />
              )}
            </Typography>

            <Box sx={{ display: "flex", gap: 1 }}>
              {!hasAudio && (
                <MicOffIcon fontSize="small" sx={{ color: "#FF5252" }} />
              )}

              {!hasVideo && (
                <VideocamOffIcon fontSize="small" sx={{ color: "#FF5252" }} />
              )}
            </Box>
          </Box>
        </Paper>
      </Grid>
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        p: 2,
        pt: 10, // Space for room controls
        pb: isMobile ? 10 : 2, // Space for room controls on mobile
        backgroundColor: "#111827",
        position: "relative",
      }}
    >
      <Grid container spacing={2}>
        {/* Render local participant */}
        {renderParticipantVideo(userName, 0)}

        {/* Render remote participants */}
        {roomParticipants
          .filter((participantId) => participantId !== userName)
          .map((participantId, index) =>
            renderParticipantVideo(participantId, index + 1)
          )}
      </Grid>
    </Box>
  );
};

export default GroupCallGrid;
