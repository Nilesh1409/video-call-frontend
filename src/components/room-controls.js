"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Tooltip,
  Badge,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  alpha,
  useMediaQuery,
  Avatar,
} from "@mui/material";
import {
  CallEnd as CallEndIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  ScreenShare as ScreenShareIcon,
  StopScreenShare as StopScreenShareIcon,
  Cameraswitch as CameraswitchIcon,
  Link as LinkIcon,
  Check as CheckIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";

const RoomControls = ({
  leaveRoom,
  toggleMute,
  toggleVideo,
  toggleScreenShare,
  switchCamera,
  isMuted,
  isVideoOff,
  isScreenSharing,
  roomId,
  roomName,
  participants,
  copyRoomLink,
  roomLinkCopied,
}) => {
  const [participantsMenuAnchor, setParticipantsMenuAnchor] = useState(null);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);

  // Responsive breakpoints
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:960px)");

  // Open participants menu
  const handleParticipantsMenuOpen = (event) => {
    setParticipantsMenuAnchor(event.currentTarget);
  };

  // Close participants menu
  const handleParticipantsMenuClose = () => {
    setParticipantsMenuAnchor(null);
  };

  // Open more menu
  const handleMoreMenuOpen = (event) => {
    setMoreMenuAnchor(event.currentTarget);
  };

  // Close more menu
  const handleMoreMenuClose = () => {
    setMoreMenuAnchor(null);
  };

  return (
    <>
      {/* Top bar with room info */}
      <Paper
        elevation={0}
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: alpha("#111827", 0.8),
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          zIndex: 1000,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              background: "linear-gradient(90deg, #6C63FF, #00E5FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mr: 1,
            }}
          >
            {roomName}
          </Typography>

          <Chip
            label={`Room ID: ${roomId}`}
            size="small"
            sx={{
              backgroundColor: alpha("#6C63FF", 0.2),
              color: "#9D97FF",
              fontWeight: 600,
              borderRadius: "8px",
              "& .MuiChip-label": {
                px: 1,
              },
            }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Copy room link">
            <IconButton
              onClick={copyRoomLink}
              size="small"
              sx={{
                color: roomLinkCopied ? "#4ADE80" : "white",
                backgroundColor: alpha(
                  roomLinkCopied ? "#4ADE80" : "#6C63FF",
                  0.2
                ),
                "&:hover": {
                  backgroundColor: alpha(
                    roomLinkCopied ? "#4ADE80" : "#6C63FF",
                    0.3
                  ),
                },
              }}
            >
              {roomLinkCopied ? (
                <CheckIcon fontSize="small" />
              ) : (
                <LinkIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title="Participants">
            <IconButton
              onClick={handleParticipantsMenuOpen}
              size="small"
              sx={{
                color: "white",
                backgroundColor: alpha("#6C63FF", 0.2),
                "&:hover": {
                  backgroundColor: alpha("#6C63FF", 0.3),
                },
              }}
            >
              <Badge
                badgeContent={participants.length}
                color="primary"
                sx={{
                  "& .MuiBadge-badge": {
                    backgroundColor: "#6C63FF",
                    color: "white",
                    fontWeight: 600,
                  },
                }}
              >
                <GroupIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          {isMobile && (
            <Tooltip title="More options">
              <IconButton
                onClick={handleMoreMenuOpen}
                size="small"
                sx={{
                  color: "white",
                  backgroundColor: alpha("#6C63FF", 0.2),
                  "&:hover": {
                    backgroundColor: alpha("#6C63FF", 0.3),
                  },
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Paper>

      {/* Bottom control bar */}
      <Paper
        elevation={0}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: isMobile ? 1 : 2,
          backgroundColor: alpha("#111827", 0.8),
          backdropFilter: "blur(10px)",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          zIndex: 1000,
        }}
      >
        {/* Mute/Unmute button */}
        <Tooltip title={isMuted ? "Unmute" : "Mute"}>
          <IconButton
            onClick={toggleMute}
            sx={{
              backgroundColor: isMuted
                ? alpha("#FF5252", 0.2)
                : alpha("#6C63FF", 0.2),
              color: isMuted ? "#FF5252" : "white",
              "&:hover": {
                backgroundColor: isMuted
                  ? alpha("#FF5252", 0.3)
                  : alpha("#6C63FF", 0.3),
                transform: "scale(1.05)",
              },
              transition: "all 0.2s ease",
              width: isMobile ? 40 : 48,
              height: isMobile ? 40 : 48,
            }}
          >
            {isMuted ? <MicOffIcon /> : <MicIcon />}
          </IconButton>
        </Tooltip>

        {/* Video on/off button */}
        <Tooltip title={isVideoOff ? "Turn on camera" : "Turn off camera"}>
          <IconButton
            onClick={toggleVideo}
            sx={{
              backgroundColor: isVideoOff
                ? alpha("#FF5252", 0.2)
                : alpha("#6C63FF", 0.2),
              color: isVideoOff ? "#FF5252" : "white",
              "&:hover": {
                backgroundColor: isVideoOff
                  ? alpha("#FF5252", 0.3)
                  : alpha("#6C63FF", 0.3),
                transform: "scale(1.05)",
              },
              transition: "all 0.2s ease",
              width: isMobile ? 40 : 48,
              height: isMobile ? 40 : 48,
            }}
          >
            {isVideoOff ? <VideocamOffIcon /> : <VideocamIcon />}
          </IconButton>
        </Tooltip>

        {/* Screen sharing button */}
        <Tooltip
          title={isScreenSharing ? "Stop sharing screen" : "Share screen"}
        >
          <IconButton
            onClick={toggleScreenShare}
            sx={{
              backgroundColor: isScreenSharing
                ? alpha("#00E5FF", 0.2)
                : alpha("#6C63FF", 0.2),
              color: isScreenSharing ? "#00E5FF" : "white",
              "&:hover": {
                backgroundColor: isScreenSharing
                  ? alpha("#00E5FF", 0.3)
                  : alpha("#6C63FF", 0.3),
                transform: "scale(1.05)",
              },
              transition: "all 0.2s ease",
              width: isMobile ? 40 : 48,
              height: isMobile ? 40 : 48,
            }}
          >
            {isScreenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
          </IconButton>
        </Tooltip>

        {/* Switch camera button - only show on non-mobile if there's space */}
        {!isMobile && (
          <Tooltip title="Switch camera">
            <IconButton
              onClick={switchCamera}
              sx={{
                backgroundColor: alpha("#6C63FF", 0.2),
                color: "white",
                "&:hover": {
                  backgroundColor: alpha("#6C63FF", 0.3),
                  transform: "scale(1.05)",
                },
                transition: "all 0.2s ease",
                width: 48,
                height: 48,
              }}
            >
              <CameraswitchIcon />
            </IconButton>
          </Tooltip>
        )}

        {/* Leave room button */}
        <IconButton
          onClick={leaveRoom}
          sx={{
            backgroundColor: alpha("#FF5252", 0.8),
            color: "white",
            "&:hover": {
              backgroundColor: "#FF5252",
              transform: "scale(1.05)",
            },
            transition: "all 0.2s ease",
            width: isMobile ? 48 : 56,
            height: isMobile ? 48 : 56,
            boxShadow: "0 4px 20px rgba(255, 82, 82, 0.3)",
          }}
        >
          <CallEndIcon />
        </IconButton>
      </Paper>

      {/* Participants menu */}
      <Menu
        anchorEl={participantsMenuAnchor}
        open={Boolean(participantsMenuAnchor)}
        onClose={handleParticipantsMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: alpha("#1E293B", 0.95),
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
            minWidth: 200,
            maxHeight: "70vh",
          },
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            px: 2,
            py: 1,
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          Participants ({participants.length})
        </Typography>

        {participants.map((participant, index) => (
          <MenuItem key={participant} sx={{ px: 2, py: 1.5 }}>
            <ListItemIcon>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  background: `linear-gradient(135deg, ${
                    index % 2 === 0 ? "#6C63FF" : "#00E5FF"
                  } 0%, ${index % 2 === 0 ? "#4A43CB" : "#00B2CC"} 100%)`,
                  fontSize: "0.9rem",
                  fontWeight: 700,
                }}
              >
                {participant.charAt(0).toUpperCase()}
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary={participant}
              secondary={participant === roomName.split("'")[0] ? "Host" : null}
              primaryTypographyProps={{
                variant: "body2",
                fontWeight: 600,
              }}
              secondaryTypographyProps={{
                variant: "caption",
                sx: { color: "#9D97FF" },
              }}
            />
          </MenuItem>
        ))}
      </Menu>

      {/* More options menu (mobile) */}
      <Menu
        anchorEl={moreMenuAnchor}
        open={Boolean(moreMenuAnchor)}
        onClose={handleMoreMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: alpha("#1E293B", 0.95),
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
            minWidth: 180,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            switchCamera();
            handleMoreMenuClose();
          }}
        >
          <ListItemIcon>
            <CameraswitchIcon fontSize="small" sx={{ color: "#9D97FF" }} />
          </ListItemIcon>
          <ListItemText primary="Switch Camera" />
        </MenuItem>

        <MenuItem
          onClick={() => {
            copyRoomLink();
            handleMoreMenuClose();
          }}
        >
          <ListItemIcon>
            {roomLinkCopied ? (
              <CheckIcon fontSize="small" sx={{ color: "#4ADE80" }} />
            ) : (
              <LinkIcon fontSize="small" sx={{ color: "#9D97FF" }} />
            )}
          </ListItemIcon>
          <ListItemText primary="Copy Room Link" />
        </MenuItem>

        <Divider sx={{ my: 1, borderColor: "rgba(255, 255, 255, 0.1)" }} />

        <MenuItem
          onClick={() => {
            handleMoreMenuClose();
          }}
        >
          <ListItemIcon>
            <SettingsIcon fontSize="small" sx={{ color: "#9D97FF" }} />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default RoomControls;
