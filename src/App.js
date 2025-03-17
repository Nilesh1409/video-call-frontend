import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import {
  Button,
  TextField,
  Box,
  Modal,
  Typography,
  Grid,
  Avatar,
  Container,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  Fade,
  useMediaQuery,
  alpha,
  Backdrop,
  InputAdornment,
  Tabs,
  Tab,
  IconButton,
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Badge,
} from "@mui/material";
import {
  Call as CallIcon,
  CallEnd as CallEndIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  Cameraswitch as CameraswitchIcon,
  ContentCopy as ContentCopyIcon,
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  ScreenShare as ScreenShareIcon,
  StopScreenShare as StopScreenShareIcon,
  Settings as SettingsIcon,
  MoreVert as MoreVertIcon,
  Logout as LogoutIcon,
  Link as LinkIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import RemoteVideo from "./components/remoteVideo";
import LocalVideo from "./components/localVideo";
import GroupCallGrid from "./components/group-call-grid";
import RoomControls from "./components/room-controls";
import "./App.css";

// Initialize socket connection
const socket = io("https://video-calling-backend-e4yf.onrender.com");

// Create a custom theme with next-gen design elements
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#6C63FF", // Vibrant purple
      light: "#9D97FF",
      dark: "#4A43CB",
    },
    secondary: {
      main: "#00E5FF", // Cyan accent
      light: "#6EFFFF",
      dark: "#00B2CC",
    },
    background: {
      default: "#111827",
      paper: "rgba(30, 41, 59, 0.8)",
    },
    error: {
      main: "#FF5252",
    },
    success: {
      main: "#4ADE80",
    },
    info: {
      main: "#38BDF8",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "10px 20px",
          boxShadow: "none",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 6px 20px rgba(108, 99, 255, 0.2)",
          },
        },
        contained: {
          background: "linear-gradient(45deg, #6C63FF 30%, #9D97FF 90%)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backdropFilter: "blur(10px)",
          borderRadius: 16,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          border: "2px solid rgba(255, 255, 255, 0.1)",
        },
      },
    },
  },
});

function App() {
  // State variables
  const [myId, setMyId] = useState("");
  const [stream, setStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState("");
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  console.log("🚀 ~ App ~ onlineUsers:", onlineUsers);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [facingMode, setFacingMode] = useState("user");
  const [modal, setModal] = useState(true);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [callStatus, setCallStatus] = useState("idle"); // idle, calling, connected
  const [localPosition, setLocalPosition] = useState({ x: null, y: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [showAnimation, setShowAnimation] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [createRoomModal, setCreateRoomModal] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [availableRooms, setAvailableRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [roomParticipants, setRoomParticipants] = useState([]);
  const [peers, setPeers] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [roomLinkCopied, setRoomLinkCopied] = useState(false);

  // Refs
  const localVideo = useRef();
  const callerVideo = useRef();
  const connectionRef = useRef();
  const peersRef = useRef({});

  // Responsive breakpoints
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:960px)");

  // Toggle mute/unmute for local audio
  const toggleMute = () => {
    if (!stream) return;

    const audioTracks = stream.getAudioTracks();
    audioTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsMuted(!isMuted);

    setNotification({
      open: true,
      message: !isMuted ? "Microphone muted" : "Microphone unmuted",
      severity: "info",
    });
  };

  // Toggle video on/off for local stream
  const toggleVideo = () => {
    if (!stream) return;

    const videoTracks = stream.getVideoTracks();
    videoTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsVideoOff(!isVideoOff);

    setNotification({
      open: true,
      message: !isVideoOff ? "Camera turned off" : "Camera turned on",
      severity: "info",
    });
  };

  // Switch between front and back camera
  const switchCamera = async () => {
    if (!stream) return;

    try {
      // Stop current tracks
      const currentTracks = stream.getTracks();
      currentTracks.forEach((track) => track.stop());

      // Request new stream with opposite facing mode
      const newFacingMode = facingMode === "user" ? "environment" : "user";
      const constraints = {
        audio: true,
        video: { facingMode: newFacingMode },
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Update state and video element
      setStream(newStream);
      setFacingMode(newFacingMode);
      if (localVideo.current) {
        localVideo.current.srcObject = newStream;
      }

      // Replace tracks in the peer connection
      if (connectionRef.current && connectionRef.current._pc) {
        newStream.getTracks().forEach((track) => {
          const sender = connectionRef.current._pc
            .getSenders()
            .find((s) => s.track && s.track.kind === track.kind);
          if (sender) {
            sender.replaceTrack(track);
          }
        });
      }

      // For group calls (if applicable)
      if (currentRoom) {
        Object.values(peersRef.current).forEach((peer) => {
          if (peer && peer._pc) {
            newStream.getTracks().forEach((track) => {
              const sender = peer._pc
                .getSenders()
                .find((s) => s.track && s.track.kind === track.kind);
              if (sender) {
                sender.replaceTrack(track);
              }
            });
          }
        });
      }

      setNotification({
        open: true,
        message: `Switched to ${
          newFacingMode === "user" ? "front" : "back"
        } camera`,
        severity: "success",
      });
    } catch (error) {
      console.error("Error switching camera:", error);
      setNotification({
        open: true,
        message: "Failed to switch camera: " + error.message,
        severity: "error",
      });
    }
  };

  // Toggle screen sharing
  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        // Start screen sharing
        const screenCaptureStream =
          await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true,
          });

        setScreenStream(screenCaptureStream);

        // Replace video track in all connections
        if (currentRoom) {
          const videoTrack = screenCaptureStream.getVideoTracks()[0];

          Object.values(peersRef.current).forEach((peer) => {
            const sender = peer
              .getSenders()
              .find((s) => s.track && s.track.kind === "video");
            if (sender) {
              sender.replaceTrack(videoTrack);
            }
          });
        } else if (connectionRef.current) {
          const videoTrack = screenCaptureStream.getVideoTracks()[0];
          const sender = connectionRef.current
            .getSenders()
            .find((s) => s.track && s.track.kind === "video");
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        }

        // Handle when user stops sharing via browser UI
        screenCaptureStream.getVideoTracks()[0].onended = () => {
          stopScreenSharing();
        };

        setIsScreenSharing(true);
        setNotification({
          open: true,
          message: "Screen sharing started",
          severity: "success",
        });
      } else {
        stopScreenSharing();
      }
    } catch (error) {
      console.error("Error toggling screen share:", error);
      setNotification({
        open: true,
        message: "Failed to share screen: " + error.message,
        severity: "error",
      });
    }
  };

  // Stop screen sharing
  const stopScreenSharing = () => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());

      // Replace with camera video track
      if (stream) {
        const videoTrack = stream.getVideoTracks()[0];

        if (currentRoom) {
          Object.values(peersRef.current).forEach((peer) => {
            const sender = peer
              .getSenders()
              .find((s) => s.track && s.track.kind === "video");
            if (sender && videoTrack) {
              sender.replaceTrack(videoTrack);
            }
          });
        } else if (connectionRef.current) {
          const sender = connectionRef.current
            .getSenders()
            .find((s) => s.track && s.track.kind === "video");
          if (sender && videoTrack) {
            sender.replaceTrack(videoTrack);
          }
        }
      }

      setScreenStream(null);
      setIsScreenSharing(false);
      setNotification({
        open: true,
        message: "Screen sharing stopped",
        severity: "info",
      });
    }
  };

  useEffect(() => {
    // Check for saved username
    if (!userName) {
      let name = localStorage.getItem("userId");
      if (name) {
        socket.emit("registerUser", name);
        setUserName(name);
        setModal(false);
      } else {
        return;
      }
    }

    // Initialize media devices
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (localVideo.current) {
          localVideo.current.srcObject = currentStream;
        }
      })
      .catch((err) => {
        console.error("Error accessing media devices:", err);
        setNotification({
          open: true,
          message: "Could not access camera or microphone: " + err.message,
          severity: "error",
        });
      });

    // Socket event listeners
    socket.on("me", (id) => {
      setMyId(id);
    });

    socket.on("callUser", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });

    socket.on("onlineUsers", (users) => {
      if (typeof users === "object") setOnlineUsers(Object.keys(users));
    });

    socket.on("availableRooms", (rooms) => {
      setAvailableRooms(rooms);
    });

    socket.on("roomCreated", ({ roomId, roomName }) => {
      setNotification({
        open: true,
        message: `Room created: ${roomName} (ID: ${roomId})`,
        severity: "success",
      });

      // Join the room we just created
      joinRoom(roomId);
    });

    socket.on("roomParticipants", ({ roomId, participants }) => {
      setRoomParticipants(participants);

      // Create peer connections with all existing participants
      if (stream) {
        participants.forEach((participantId) => {
          if (participantId !== userName) {
            createPeer(participantId, roomId, stream);
          }
        });
      }
    });

    socket.on("userJoinedRoom", ({ roomId, userId, participants }) => {
      setRoomParticipants(participants);

      if (userId !== userName && stream) {
        // Create a peer connection for the new user
        const peer = addPeer(userId, roomId, stream);
        peersRef.current[userId] = peer;

        setPeers((prevPeers) => ({
          ...prevPeers,
          [userId]: { peer },
        }));
      }

      setNotification({
        open: true,
        message: `${userId} joined the room`,
        severity: "info",
      });
    });

    socket.on("userLeftRoom", ({ roomId, userId, participants }) => {
      setRoomParticipants(participants);

      // Clean up peer connection
      if (peersRef.current[userId]) {
        peersRef.current[userId].destroy();
        delete peersRef.current[userId];

        setPeers((prevPeers) => {
          const newPeers = { ...prevPeers };
          delete newPeers[userId];
          return newPeers;
        });
      }

      setNotification({
        open: true,
        message: `${userId} left the room`,
        severity: "info",
      });
    });

    socket.on("receiveSignal", ({ signal, from }) => {
      if (peersRef.current[from]) {
        peersRef.current[from].signal(signal);
      }
    });

    socket.on("roomError", ({ message }) => {
      setNotification({
        open: true,
        message,
        severity: "error",
      });
    });

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
      }

      socket.off("me");
      socket.off("callUser");
      socket.off("onlineUsers");
      socket.off("callAccepted");
      socket.off("callEnded");
      socket.off("availableRooms");
      socket.off("roomCreated");
      socket.off("roomParticipants");
      socket.off("userJoinedRoom");
      socket.off("userLeftRoom");
      socket.off("receiveSignal");
      socket.off("roomError");
    };
  }, [userName]);

  // Create a peer connection as the initiator
  const createPeer = (userToSignal, roomId, stream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("sendSignal", {
        signal,
        userId: userName,
        roomId,
        to: userToSignal,
      });
    });

    peer.on("stream", (remoteStream) => {
      // Store the stream for this peer
      setPeers((prevPeers) => ({
        ...prevPeers,
        [userToSignal]: {
          ...prevPeers[userToSignal],
          stream: remoteStream,
        },
      }));
    });

    peersRef.current[userToSignal] = peer;

    return peer;
  };

  // Add a peer connection as the receiver
  const addPeer = (userToSignal, roomId, stream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("sendSignal", {
        signal,
        userId: userName,
        roomId,
        to: userToSignal,
      });
    });

    peer.on("stream", (remoteStream) => {
      // Store the stream for this peer
      setPeers((prevPeers) => ({
        ...prevPeers,
        [userToSignal]: {
          ...prevPeers[userToSignal],
          stream: remoteStream,
        },
      }));
    });

    return peer;
  };

  // Create a new room
  const createRoom = () => {
    if (!roomName.trim()) {
      setRoomName(`${userName}'s Room`);
    }

    socket.emit("createRoom", {
      userId: userName,
      roomName: roomName.trim() || `${userName}'s Room`,
    });

    setCreateRoomModal(false);
  };

  // Join an existing room
  const joinRoom = (roomId) => {
    // Leave current room if in one
    if (currentRoom) {
      leaveRoom();
    }

    // Clean up any existing 1-on-1 call
    if (callAccepted && !callEnded) {
      leaveCall();
    }

    socket.emit("joinRoom", {
      userId: userName,
      roomId,
    });

    setCurrentRoom(roomId);
    setCallStatus("connected");

    // Reset peers
    Object.values(peersRef.current).forEach((peer) => peer.destroy());
    peersRef.current = {};
    setPeers({});
  };

  // Leave the current room
  const leaveRoom = () => {
    if (currentRoom) {
      socket.emit("leaveRoom", {
        userId: userName,
        roomId: currentRoom,
      });

      // Clean up peer connections
      Object.values(peersRef.current).forEach((peer) => peer.destroy());
      peersRef.current = {};
      setPeers({});

      setCurrentRoom(null);
      setRoomParticipants([]);
      setCallStatus("idle");

      // Stop screen sharing if active
      if (isScreenSharing) {
        stopScreenSharing();
      }
    }
  };

  // Call another user (1-on-1)
  const callUser = (id) => {
    // Leave room if in one
    if (currentRoom) {
      leaveRoom();
    }

    setCallStatus("calling");
    setShowAnimation(true);

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    setIdToCall(id);

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: userName,
        name: userName,
      });
    });

    peer.on("stream", (remoteStream) => {
      if (callerVideo.current) {
        callerVideo.current.srcObject = remoteStream;
      }
    });

    peer.on("error", (err) => {
      console.error("Peer connection error:", err);
      setNotification({
        open: true,
        message: "Connection error: " + err.message,
        severity: "error",
      });
      setCallStatus("idle");
      setShowAnimation(false);
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      setCallStatus("connected");
      setShowAnimation(false);
      peer.signal(signal);

      setNotification({
        open: true,
        message: "Call connected",
        severity: "success",
      });
    });

    connectionRef.current = peer;

    socket.on("callEnded", () => {
      endCall();
    });

    // Set a timeout to end the call attempt if not answered
    setTimeout(() => {
      if (callStatus === "calling") {
        setNotification({
          open: true,
          message: "No answer. Call ended",
          severity: "info",
        });
        setCallStatus("idle");
        setShowAnimation(false);
      }
    }, 30000);
  };

  // Answer an incoming call
  const answerCall = () => {
    setCallAccepted(true);
    setCallStatus("connected");

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller });
    });

    peer.on("stream", (remoteStream) => {
      if (callerVideo.current) {
        callerVideo.current.srcObject = remoteStream;
      }
    });

    peer.on("error", (err) => {
      console.error("Peer connection error:", err);
      setNotification({
        open: true,
        message: "Connection error: " + err.message,
        severity: "error",
      });
      endCall();
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;

    socket.on("callEnded", () => {
      endCall();
    });

    setNotification({
      open: true,
      message: "Call connected",
      severity: "success",
    });
  };

  // Leave the current call
  const leaveCall = () => {
    setCallEnded(true);

    if (connectionRef.current) {
      connectionRef.current.destroy();
    }

    socket.emit("endCall", { to: idToCall || caller });

    setCallAccepted(false);
    setCallerSignal(null);
    setReceivingCall(false);
    setCallStatus("idle");

    // Stop screen sharing if active
    if (isScreenSharing) {
      stopScreenSharing();
    }

    setNotification({
      open: true,
      message: "Call ended",
      severity: "info",
    });
  };

  // End call (when the other party ends it)
  const endCall = () => {
    setCallAccepted(false);
    setCallerSignal(null);
    setReceivingCall(false);
    setCallStatus("idle");

    // Stop screen sharing if active
    if (isScreenSharing) {
      stopScreenSharing();
    }

    setNotification({
      open: true,
      message: "Call ended by other user",
      severity: "info",
    });
  };

  // Handle username submission
  const handleUserNameSubmit = () => {
    if (!userName || userName.trim() === "") {
      setNotification({
        open: true,
        message: "Please enter a valid username",
        severity: "error",
      });
      return;
    }

    localStorage.setItem("userId", userName);
    socket.emit("registerUser", userName);
    setModal(false);

    setNotification({
      open: true,
      message: `Welcome, ${userName}!`,
      severity: "success",
    });
  };

  // Copy user ID to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text || myId || userName);
    setNotification({
      open: true,
      message: "ID copied to clipboard",
      severity: "success",
    });
  };

  // Copy room link to clipboard
  const copyRoomLink = () => {
    const roomLink = `${window.location.origin}?room=${currentRoom}`;
    navigator.clipboard.writeText(roomLink);
    setRoomLinkCopied(true);

    setTimeout(() => {
      setRoomLinkCopied(false);
    }, 2000);

    setNotification({
      open: true,
      message: "Room link copied to clipboard",
      severity: "success",
    });
  };

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

  // Filter online users based on search term
  const filteredUsers = onlineUsers.filter(
    (user) =>
      user !== userName && user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter available rooms based on search term
  const filteredRooms = availableRooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSearchTerm("");
  };

  // Handle menu open
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Check if URL has room parameter and join that room
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get("room");

    if (roomId && userName) {
      joinRoom(roomId);
    }
  }, [userName]);

  return (
    <ThemeProvider theme={theme}>
      <Container
        maxWidth={false}
        disableGutters
        className="app-container"
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          padding: 0,
          overflow: "scroll",
          background: "linear-gradient(135deg, #111827 0%, #1E293B 100%)",
          position: "relative",
          marginBottom: "200px",
        }}
      >
        {/* Background elements */}
        <Box className="bg-elements">
          <div className="bg-circle circle-1"></div>
          <div className="bg-circle circle-2"></div>
          <div className="bg-circle circle-3"></div>
        </Box>

        {/* Username Modal */}
        <Modal
          open={modal}
          onClose={() => {}}
          disableEscapeKeyDown
          BackdropComponent={Backdrop}
          BackdropProps={{
            sx: {
              backdropFilter: "blur(8px)",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
            },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: isMobile ? "90%" : 400,
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
              p: 4,
              borderRadius: "24px",
              display: "flex",
              flexDirection: "column",
              gap: 3,
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h4"
                component="h2"
                gutterBottom
                sx={{
                  background: "linear-gradient(90deg, #6C63FF, #00E5FF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 700,
                  letterSpacing: "-0.5px",
                }}
              >
                Welcome to Nexus
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  opacity: 0.8,
                  maxWidth: "80%",
                  mx: "auto",
                }}
              >
                Connect with anyone, anywhere with crystal clear video
              </Typography>
            </Box>

            <TextField
              fullWidth
              id="userId"
              label="Create Your ID"
              variant="outlined"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleUserNameSubmit()}
              autoFocus
              InputProps={{
                sx: {
                  backdropFilter: "blur(10px)",
                  backgroundColor: alpha(theme.palette.background.paper, 0.4),
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.background.paper, 0.6),
                  },
                  "&.Mui-focused": {
                    backgroundColor: alpha(theme.palette.background.paper, 0.6),
                  },
                },
              }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleUserNameSubmit}
              sx={{
                py: 1.5,
                fontSize: "1rem",
                background: "linear-gradient(90deg, #6C63FF, #00E5FF)",
                boxShadow: "0 4px 20px rgba(108, 99, 255, 0.5)",
                "&:hover": {
                  background: "linear-gradient(90deg, #5A52E0, #00D0EB)",
                  boxShadow: "0 6px 25px rgba(108, 99, 255, 0.6)",
                },
              }}
            >
              Get Started
            </Button>
          </Box>
        </Modal>

        {/* Create Room Modal */}
        <Modal
          open={createRoomModal}
          onClose={() => setCreateRoomModal(false)}
          BackdropComponent={Backdrop}
          BackdropProps={{
            sx: {
              backdropFilter: "blur(8px)",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              marginBottom: "50px",
              overflow: "scroll",
            },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: isMobile ? "90%" : 400,
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
              p: 4,
              borderRadius: "24px",
              display: "flex",
              flexDirection: "column",
              gap: 3,
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                letterSpacing: "-0.5px",
                background: "linear-gradient(90deg, #6C63FF, #00E5FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Create a Room
            </Typography>

            <TextField
              fullWidth
              label="Room Name"
              variant="outlined"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder={`${userName}'s Room`}
              onKeyPress={(e) => e.key === "Enter" && createRoom()}
              autoFocus
              InputProps={{
                sx: {
                  backdropFilter: "blur(10px)",
                  backgroundColor: alpha(theme.palette.background.paper, 0.4),
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.background.paper, 0.6),
                  },
                  "&.Mui-focused": {
                    backgroundColor: alpha(theme.palette.background.paper, 0.6),
                  },
                },
              }}
            />

            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={() => setCreateRoomModal(false)}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                onClick={createRoom}
                sx={{
                  background: "linear-gradient(90deg, #6C63FF, #00E5FF)",
                  boxShadow: "0 4px 20px rgba(108, 99, 255, 0.3)",
                  "&:hover": {
                    background: "linear-gradient(90deg, #5A52E0, #00D0EB)",
                    boxShadow: "0 6px 25px rgba(108, 99, 255, 0.4)",
                  },
                }}
              >
                Create Room
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={4000}
          onClose={() => setNotification({ ...notification, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          sx={{
            "& .MuiAlert-root": {
              backdropFilter: "blur(10px)",
              backgroundColor: alpha(
                notification.severity === "error"
                  ? theme.palette.error.dark
                  : notification.severity === "success"
                  ? theme.palette.success.dark
                  : theme.palette.info.dark,
                0.9
              ),
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          <Alert
            onClose={() => setNotification({ ...notification, open: false })}
            severity={notification.severity}
            sx={{ width: "100%" }}
            variant="filled"
          >
            {notification.message}
          </Alert>
        </Snackbar>

        {/* Calling Animation Backdrop */}
        <Backdrop
          sx={{
            color: "#fff",
            zIndex: (theme) => theme.zIndex.drawer + 1,
            flexDirection: "column",
            gap: 3,
            backdropFilter: "blur(8px)",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          }}
          open={showAnimation}
        >
          <Box className="calling-animation">
            <div className="calling-ripple"></div>
            <div className="calling-ripple"></div>
            <div className="calling-ripple"></div>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Calling {idToCall}...
          </Typography>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              setCallStatus("idle");
              setShowAnimation(false);
              if (connectionRef.current) {
                connectionRef.current.destroy();
              }
            }}
            sx={{
              mt: 2,
              borderColor: alpha(theme.palette.error.main, 0.5),
              "&:hover": {
                borderColor: theme.palette.error.main,
                backgroundColor: alpha(theme.palette.error.main, 0.1),
              },
            }}
          >
            Cancel
          </Button>
        </Backdrop>

        {/* Main Content */}
        {!modal && (
          <>
            {/* Call in progress view - 1-on-1 call */}
            {callAccepted && !callEnded && !currentRoom ? (
              <>
                <RemoteVideo
                  leaveCall={leaveCall}
                  callEnded={callEnded}
                  videoRef={callerVideo}
                  toggleScreenShare={toggleScreenShare}
                  isScreenSharing={isScreenSharing}
                />

                <LocalVideo
                  videoRef={localVideo}
                  toggleMute={toggleMute}
                  toggleVideo={toggleVideo}
                  switchCamera={switchCamera}
                  isMuted={isMuted}
                  isVideoOff={isVideoOff}
                  position={localPosition}
                  setPosition={setLocalPosition}
                />
              </>
            ) : currentRoom ? (
              /* Group call view */
              <>
                <GroupCallGrid
                  peers={peers}
                  localStream={stream}
                  localVideoRef={localVideo}
                  userName={userName}
                  roomParticipants={roomParticipants}
                />

                <RoomControls
                  leaveRoom={leaveRoom}
                  toggleMute={toggleMute}
                  toggleVideo={toggleVideo}
                  toggleScreenShare={toggleScreenShare}
                  switchCamera={switchCamera}
                  isMuted={isMuted}
                  isVideoOff={isVideoOff}
                  isScreenSharing={isScreenSharing}
                  roomId={currentRoom}
                  roomName={
                    availableRooms.find((r) => r.id === currentRoom)?.name ||
                    currentRoom
                  }
                  participants={roomParticipants}
                  copyRoomLink={copyRoomLink}
                  roomLinkCopied={roomLinkCopied}
                />
              </>
            ) : (
              /* Home screen view */
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  gap: 3,
                  p: isMobile ? 2 : 3,
                  position: "relative",
                  zIndex: 1,
                  // border: "1px solid red",
                  marginBottom: "50px",
                  overflow: "scroll !important",
                }}
              >
                {/* Header with user info */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: "24px",
                    backgroundColor: alpha(theme.palette.background.paper, 0.6),
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 15px 35px rgba(0, 0, 0, 0.3)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        background:
                          "linear-gradient(135deg, #6C63FF 0%, #4A43CB 100%)",
                        boxShadow: "0 4px 20px rgba(108, 99, 255, 0.3)",
                        fontSize: "1.5rem",
                        fontWeight: 700,
                      }}
                    >
                      {userName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          letterSpacing: "-0.5px",
                        }}
                      >
                        {userName}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          cursor: "pointer",
                          p: 0.5,
                          borderRadius: "8px",
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.1
                            ),
                          },
                        }}
                        onClick={() => copyToClipboard(userName)}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontFamily: "monospace",
                            letterSpacing: "-0.5px",
                          }}
                        >
                          ID: {userName}
                        </Typography>
                        <ContentCopyIcon
                          fontSize="small"
                          color="primary"
                          sx={{ opacity: 0.8 }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  {/* Preview of local video */}
                  <Box
                    sx={{
                      width: isMobile ? 80 : 120,
                      height: isMobile ? 60 : 90,
                      borderRadius: "16px",
                      overflow: "hidden",
                      border: "2px solid rgba(255, 255, 255, 0.1)",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                      position: "relative",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: "14px",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        pointerEvents: "none",
                      },
                    }}
                  >
                    <video
                      ref={localVideo}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                </Paper>

                {/* Main content with tabs */}
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: "24px",
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                    overflow: "hidden",
                    backgroundColor: alpha(theme.palette.background.paper, 0.6),
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  {/* Tabs and search */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 2,
                      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <Tabs
                      value={tabValue}
                      onChange={handleTabChange}
                      sx={{
                        "& .MuiTabs-indicator": {
                          backgroundColor: theme.palette.primary.main,
                          height: 3,
                          borderRadius: "3px",
                        },
                        "& .MuiTab-root": {
                          textTransform: "none",
                          fontWeight: 600,
                          fontSize: "1rem",
                          minWidth: "auto",
                          px: 2,
                          "&.Mui-selected": {
                            color: theme.palette.primary.main,
                          },
                        },
                      }}
                    >
                      <Tab
                        icon={<PersonIcon />}
                        iconPosition="start"
                        label={isMobile ? "" : "Direct Call"}
                      />
                      <Tab
                        icon={<GroupIcon />}
                        iconPosition="start"
                        label={isMobile ? "" : "Group Rooms"}
                      />
                    </Tabs>

                    <Box sx={{ display: "flex", gap: 1 }}>
                      <TextField
                        placeholder={
                          tabValue === 0 ? "Search users" : "Search rooms"
                        }
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon fontSize="small" />
                            </InputAdornment>
                          ),
                          sx: {
                            borderRadius: "12px",
                            backdropFilter: "blur(10px)",
                            backgroundColor: alpha(
                              theme.palette.background.paper,
                              0.4
                            ),
                            "&:hover": {
                              backgroundColor: alpha(
                                theme.palette.background.paper,
                                0.6
                              ),
                            },
                            "&.Mui-focused": {
                              backgroundColor: alpha(
                                theme.palette.background.paper,
                                0.6
                              ),
                            },
                          },
                        }}
                        sx={{ width: isMobile ? 120 : 200 }}
                      />

                      {tabValue === 1 && (
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setCreateRoomModal(true)}
                          sx={{
                            borderRadius: "12px",
                            background:
                              "linear-gradient(90deg, #6C63FF, #00E5FF)",
                            boxShadow: "0 4px 15px rgba(108, 99, 255, 0.3)",
                            "&:hover": {
                              background:
                                "linear-gradient(90deg, #5A52E0, #00D0EB)",
                              boxShadow: "0 6px 20px rgba(108, 99, 255, 0.4)",
                            },
                          }}
                        >
                          {isMobile ? "" : "Create Room"}
                        </Button>
                      )}
                    </Box>
                  </Box>

                  {/* Tab content */}
                  <Box
                    sx={{
                      flexGrow: 1,
                      overflow: "auto",
                      p: 2,
                      "&::-webkit-scrollbar": {
                        width: "6px",
                      },
                      "&::-webkit-scrollbar-track": {
                        background: "transparent",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        background: alpha(theme.palette.primary.main, 0.3),
                        borderRadius: "3px",
                      },
                      "&::-webkit-scrollbar-thumb:hover": {
                        background: alpha(theme.palette.primary.main, 0.5),
                      },
                    }}
                  >
                    {/* Direct Call Tab */}
                    {tabValue === 0 && (
                      <>
                        {/* Call by ID */}
                        <Box
                          sx={{
                            mb: 3,
                            p: 2,
                            borderRadius: "16px",
                            backgroundColor: alpha(
                              theme.palette.background.paper,
                              0.4
                            ),
                            backdropFilter: "blur(5px)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 600,
                              mb: 2,
                            }}
                          >
                            Call by ID
                          </Typography>

                          <Box
                            sx={{
                              display: "flex",
                              gap: 1.5,
                              flexDirection: isMobile ? "column" : "row",
                            }}
                          >
                            <TextField
                              fullWidth
                              id="callid"
                              label="Enter Friend's Call ID"
                              variant="outlined"
                              size={isMobile ? "medium" : "medium"}
                              InputProps={{
                                sx: {
                                  backdropFilter: "blur(10px)",
                                  backgroundColor: alpha(
                                    theme.palette.background.paper,
                                    0.4
                                  ),
                                  "&:hover": {
                                    backgroundColor: alpha(
                                      theme.palette.background.paper,
                                      0.6
                                    ),
                                  },
                                  "&.Mui-focused": {
                                    backgroundColor: alpha(
                                      theme.palette.background.paper,
                                      0.6
                                    ),
                                  },
                                },
                              }}
                            />

                            <Button
                              variant="contained"
                              color="primary"
                              startIcon={<CallIcon />}
                              disabled={callStatus === "calling"}
                              onClick={() => {
                                const userId =
                                  document.getElementById("callid").value;
                                if (!userId || userId.trim() === "") {
                                  setNotification({
                                    open: true,
                                    message: "Please enter a valid ID",
                                    severity: "error",
                                  });
                                  return;
                                }
                                callUser(userId);
                              }}
                              sx={{
                                minWidth: isMobile ? "100%" : 180,
                                height: isMobile ? "auto" : 56,
                                background:
                                  "linear-gradient(90deg, #6C63FF, #00E5FF)",
                                boxShadow: "0 4px 20px rgba(108, 99, 255, 0.3)",
                                "&:hover": {
                                  background:
                                    "linear-gradient(90deg, #5A52E0, #00D0EB)",
                                  boxShadow:
                                    "0 6px 25px rgba(108, 99, 255, 0.4)",
                                },
                              }}
                            >
                              {callStatus === "calling" ? (
                                <>
                                  <CircularProgress
                                    size={24}
                                    color="inherit"
                                    sx={{ mr: 1 }}
                                  />
                                  Calling...
                                </>
                              ) : (
                                "Start Call"
                              )}
                            </Button>
                          </Box>
                        </Box>

                        {/* Online users */}
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            mb: 2,
                            background:
                              "linear-gradient(90deg, #6C63FF, #00E5FF)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          Online Users
                        </Typography>

                        <Grid container spacing={2}>
                          {filteredUsers.length > 0 ? (
                            filteredUsers.map((user, index) => (
                              <Grid
                                item
                                key={index}
                                xs={6}
                                sm={4}
                                md={3}
                                lg={2}
                              >
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 2.5,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 1.5,
                                    height: "100%",
                                    borderRadius: "20px",
                                    transition: "all 0.3s ease",
                                    backgroundColor: alpha(
                                      theme.palette.background.paper,
                                      0.4
                                    ),
                                    backdropFilter: "blur(10px)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.1)",
                                    "&:hover": {
                                      transform: "translateY(-8px) scale(1.02)",
                                      boxShadow:
                                        "0 15px 35px rgba(0, 0, 0, 0.2)",
                                      backgroundColor: alpha(
                                        theme.palette.background.paper,
                                        0.6
                                      ),
                                    },
                                  }}
                                >
                                  <Avatar
                                    alt={user}
                                    sx={{
                                      width: 70,
                                      height: 70,
                                      background: getRandomColor(index),
                                      fontSize: "1.8rem",
                                      fontWeight: 700,
                                      boxShadow:
                                        "0 4px 20px rgba(0, 0, 0, 0.2)",
                                      border:
                                        "3px solid rgba(255, 255, 255, 0.1)",
                                    }}
                                  >
                                    {user.charAt(0).toUpperCase()}
                                  </Avatar>

                                  <Typography
                                    variant="subtitle1"
                                    align="center"
                                    sx={{
                                      fontWeight: 600,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      width: "100%",
                                    }}
                                  >
                                    {user}
                                  </Typography>

                                  <Button
                                    variant="contained"
                                    color="primary"
                                    size="medium"
                                    startIcon={<CallIcon />}
                                    fullWidth
                                    onClick={() => callUser(user)}
                                    disabled={callStatus === "calling"}
                                    sx={{
                                      borderRadius: "12px",
                                      background:
                                        "linear-gradient(90deg, #6C63FF, #00E5FF)",
                                      boxShadow:
                                        "0 4px 15px rgba(108, 99, 255, 0.3)",
                                      "&:hover": {
                                        background:
                                          "linear-gradient(90deg, #5A52E0, #00D0EB)",
                                        boxShadow:
                                          "0 6px 20px rgba(108, 99, 255, 0.4)",
                                      },
                                    }}
                                  >
                                    Call
                                  </Button>
                                </Paper>
                              </Grid>
                            ))
                          ) : (
                            <Grid item xs={12}>
                              <Box
                                sx={{
                                  py: 6,
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: 2,
                                  opacity: 0.7,
                                }}
                              >
                                <Typography
                                  variant="body1"
                                  align="center"
                                  color="text.secondary"
                                >
                                  {searchTerm
                                    ? "No users match your search"
                                    : "No other users are currently online"}
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                      </>
                    )}

                    {/* Group Rooms Tab */}
                    {tabValue === 1 && (
                      <>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            mb: 2,
                            background:
                              "linear-gradient(90deg, #6C63FF, #00E5FF)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          Available Rooms
                        </Typography>

                        <Grid container spacing={2}>
                          {filteredRooms.length > 0 ? (
                            filteredRooms.map((room, index) => (
                              <Grid item key={index} xs={12} sm={6} md={4}>
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 2.5,
                                    display: "flex",
                                    flexDirection: "column",
                                    height: "100%",
                                    borderRadius: "20px",
                                    transition: "all 0.3s ease",
                                    backgroundColor: alpha(
                                      theme.palette.background.paper,
                                      0.4
                                    ),
                                    backdropFilter: "blur(10px)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.1)",
                                    "&:hover": {
                                      transform: "translateY(-8px)",
                                      boxShadow:
                                        "0 15px 35px rgba(0, 0, 0, 0.2)",
                                      backgroundColor: alpha(
                                        theme.palette.background.paper,
                                        0.6
                                      ),
                                    },
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      mb: 2,
                                    }}
                                  >
                                    <Typography
                                      variant="h6"
                                      sx={{
                                        fontWeight: 600,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {room.name}
                                    </Typography>

                                    <Chip
                                      label={`${room.participants} ${
                                        room.participants === 1
                                          ? "person"
                                          : "people"
                                      }`}
                                      size="small"
                                      sx={{
                                        backgroundColor: alpha(
                                          theme.palette.primary.main,
                                          0.2
                                        ),
                                        color: theme.palette.primary.light,
                                        fontWeight: 600,
                                      }}
                                    />
                                  </Box>

                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                      mb: 2,
                                      p: 1,
                                      borderRadius: "8px",
                                      backgroundColor: alpha(
                                        theme.palette.background.paper,
                                        0.3
                                      ),
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{
                                        fontFamily: "monospace",
                                        letterSpacing: "-0.5px",
                                        flexGrow: 1,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      ID: {room.id}
                                    </Typography>

                                    <IconButton
                                      size="small"
                                      onClick={() => copyToClipboard(room.id)}
                                      sx={{ color: theme.palette.primary.main }}
                                    >
                                      <ContentCopyIcon fontSize="small" />
                                    </IconButton>
                                  </Box>

                                  <Box sx={{ mt: "auto" }}>
                                    <Button
                                      variant="contained"
                                      fullWidth
                                      startIcon={<GroupIcon />}
                                      onClick={() => joinRoom(room.id)}
                                      sx={{
                                        borderRadius: "12px",
                                        background:
                                          "linear-gradient(90deg, #6C63FF, #00E5FF)",
                                        boxShadow:
                                          "0 4px 15px rgba(108, 99, 255, 0.3)",
                                        "&:hover": {
                                          background:
                                            "linear-gradient(90deg, #5A52E0, #00D0EB)",
                                          boxShadow:
                                            "0 6px 20px rgba(108, 99, 255, 0.4)",
                                        },
                                      }}
                                    >
                                      Join Room
                                    </Button>
                                  </Box>
                                </Paper>
                              </Grid>
                            ))
                          ) : (
                            <Grid item xs={12}>
                              <Box
                                sx={{
                                  py: 6,
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: 2,
                                  opacity: 0.7,
                                }}
                              >
                                <Typography
                                  variant="body1"
                                  align="center"
                                  color="text.secondary"
                                >
                                  {searchTerm
                                    ? "No rooms match your search"
                                    : "No rooms available. Create one to get started!"}
                                </Typography>

                                {!searchTerm && (
                                  <Button
                                    variant="outlined"
                                    startIcon={<AddIcon />}
                                    onClick={() => setCreateRoomModal(true)}
                                  >
                                    Create a Room
                                  </Button>
                                )}
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                      </>
                    )}
                  </Box>
                </Paper>

                {/* Incoming call notification */}
                {receivingCall && !callAccepted && (
                  <Fade in={receivingCall}>
                    <Paper
                      elevation={4}
                      sx={{
                        p: 2.5,
                        mt: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        bgcolor: alpha(theme.palette.primary.dark, 0.4),
                        color: "white",
                        borderRadius: "16px",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        animation: "pulse 1.5s infinite",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Avatar
                          sx={{
                            background:
                              "linear-gradient(135deg, #6C63FF 0%, #4A43CB 100%)",
                            boxShadow: "0 4px 20px rgba(108, 99, 255, 0.3)",
                          }}
                        >
                          {name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          <b>{name}</b> is calling you
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1.5,
                        }}
                      >
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<CallIcon />}
                          onClick={answerCall}
                          sx={{
                            background:
                              "linear-gradient(90deg, #4ADE80, #22C55E)",
                            boxShadow: "0 4px 20px rgba(74, 222, 128, 0.3)",
                            "&:hover": {
                              background:
                                "linear-gradient(90deg, #3FCB70, #1CAA4E)",
                              boxShadow: "0 6px 25px rgba(74, 222, 128, 0.4)",
                            },
                          }}
                        >
                          Answer
                        </Button>

                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<CallEndIcon />}
                          onClick={() => setReceivingCall(false)}
                          sx={{
                            background:
                              "linear-gradient(90deg, #FF5252, #D32F2F)",
                            boxShadow: "0 4px 20px rgba(255, 82, 82, 0.3)",
                            "&:hover": {
                              background:
                                "linear-gradient(90deg, #F04545, #C62828)",
                              boxShadow: "0 6px 25px rgba(255, 82, 82, 0.4)",
                            },
                          }}
                        >
                          Decline
                        </Button>
                      </Box>
                    </Paper>
                  </Fade>
                )}

                {/* Media controls when not in a call */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: "24px",
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                    backgroundColor: alpha(theme.palette.background.paper, 0.6),
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <Button
                    variant={isMuted ? "contained" : "outlined"}
                    color={isMuted ? "error" : "primary"}
                    onClick={toggleMute}
                    startIcon={isMuted ? <MicOffIcon /> : <MicIcon />}
                    sx={{
                      borderRadius: "12px",
                      ...(isMuted
                        ? {
                            background:
                              "linear-gradient(90deg, #FF5252, #D32F2F)",
                            boxShadow: "0 4px 15px rgba(255, 82, 82, 0.3)",
                          }
                        : {}),
                    }}
                  >
                    {isMuted ? "Unmute" : "Mute"}
                  </Button>

                  <Button
                    variant={isVideoOff ? "contained" : "outlined"}
                    color={isVideoOff ? "error" : "primary"}
                    onClick={toggleVideo}
                    startIcon={
                      isVideoOff ? <VideocamOffIcon /> : <VideocamIcon />
                    }
                    sx={{
                      borderRadius: "12px",
                      ...(isVideoOff
                        ? {
                            background:
                              "linear-gradient(90deg, #FF5252, #D32F2F)",
                            boxShadow: "0 4px 15px rgba(255, 82, 82, 0.3)",
                          }
                        : {}),
                    }}
                  >
                    {isVideoOff ? "Start Video" : "Stop Video"}
                  </Button>

                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={switchCamera}
                    startIcon={<CameraswitchIcon />}
                    sx={{ borderRadius: "12px" }}
                  >
                    Switch Camera
                  </Button>
                </Paper>
              </Box>
            )}
          </>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
