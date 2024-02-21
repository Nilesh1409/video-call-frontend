import { useState, useEffect, useRef } from "react";
import RemoteVideo from "./components/remoteVideo";
import VideoPreview from "./components/localVideo";
import "./App.css";
import io from "socket.io-client";
import Peer from "simple-peer";
import { Button, Grid, TextField } from "@mui/material";
import CopyToClipboard from "react-copy-to-clipboard";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import { deepPurple } from "@mui/material/colors";

// import Button from "@mui/material/Button";
// import Typography from "@mui/material/Typography";
// const socket = io("https://video-calling-backend-e4yf.onrender.com"); // change to your server address if needed
const socket = io("http://localhost:8080");
function App() {
  const [myId, setMyId] = useState("");
  const [stream, setStream] = useState("");
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState("");
  const [callAccepted, setCallAccepted] = useState("");
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  const [copyText, setCopyText] = useState("Copy");
  const [callText, setCallText] = useState("Call");
  const [modal, setModal] = useState(true);
  const [userName, setUserName] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([
    "Nilesh",
    "Saniii",
    "Saniii",
    "Saniii",
  ]);

  const localVideo = useRef();
  const callerVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    console.log("🚀 ~ App ~ useEffect localVideo:28", localVideo);
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
    // get video and audio
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream); // Store the local video stream in state for further use
        localVideo.current.srcObject = currentStream;
        // Show user's camera feed on the page
      });
    console.log("🚀 ~ App ~ useEffect localVideo:37", localVideo);

    // Request the ID from the server
    socket.on("me", (id) => {
      console.log("🚀 ~ socket.on ~ id:", id);
      setMyId(id);
    });

    // Listen for a call being made
    socket.on("callUser", (data) => {
      console.log("🚀 ~ socket.on ~ callmade: getting answer", data);
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });

    socket.on("onlineUsers", (users) => {
      console.log("🚀 ~ socket.on ~ users:", users);
      if (typeof users === "object") setOnlineUsers(Object.keys(users));
    });
    // }
  }, []);

  console.log("🚀 ~ App ~ localVideo:55", localVideo);
  console.log("🚀 ~ App ~ stream:55", stream);

  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });
    let user = document.getElementById("callid").value;
    setUserName(user);
    console.log("🚀 ~ callUser ~ user:", user);

    peer.on("signal", (data) => {
      // Send signal data to the friend you want to call
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: user,
        name: user,
      });
    });

    peer.on("stream", (remoteStream) => {
      console.log("🚀 ~ peer.on ~ remoteStream109:", remoteStream);
      // Display the remote stream in the remoteVideoRef video element
      callerVideo.current.srcObject = remoteStream;
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      console.log("🚀 ~ socket.on ~ signal:116", signal);
      peer.signal(signal);
    });

    connectionRef.current = peer;
    socket.on("callEnded", () => {
      endCall();
    });
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      console.log("🚀 ~ pee129", data);
      socket.emit("answerCall", { signal: data, to: caller });
    });

    peer.on("stream", (remoteStream) => {
      callerVideo.current.srcObject = remoteStream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;

    socket.on("callEnded", () => {
      endCall();
    });
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
    setCallAccepted(false);
    setCallerSignal(null);
    setReceivingCall(false);
    // discoonect the connection
    // socket.emit("disconnect");
  };

  const endCall = () => {
    setCallAccepted(false);
    setCallerSignal(null);
    setReceivingCall(false);
  };

  const handleModalClose = () => {
    setModal(false);
  };

  const handleUserNameSubmit = () => {
    localStorage.setItem("userId", userName);

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream); // Store the local video stream in state for further use
        localVideo.current.srcObject = currentStream;
        // Show user's camera feed on the page
      });

    // Request the ID from the server
    socket.on("me", (id) => {
      console.log("🚀 ~ socket.on ~ id:", id);
      setMyId(id);
    });

    // Listen for a call being made
    socket.on("callUser", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });

    socket.emit("registerUser", userName);

    handleModalClose();
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  const getRandomColor = () => {
    const colors = [
      "#D291BC", // Muted pink, less vibrant than bright pink (#FFC0CB)
      "#C5B358", // Dull gold, a darker and less vibrant version of bright yellow (#FFD700)
      "#5F4B8B", // Deep lilac, less vibrant than indigo (#6A5ACD)
      "#4CBB17", // Kelly green, darker and less vibrant than lime green (#00FF00)
      "#C06014", // Burnt orange, a darker and less vibrant version of bright orange (#FF4500)
      "#3B9C9C", // Desaturated teal, less vibrant than bright turquoise (#00CED1)
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Placeholder image or you can use any specific logic to generate avatar images
  const avatarPlaceholder = [
    "https://sdk.bitmoji.com/render/panel/6d228887-e76d-4678-a578-a47592240081-ecc3b852-1428-481b-8bbd-7af6e70a6e07-v1.png?transparent=1&palette=1",
    "https://i.pinimg.com/originals/6c/3a/19/6c3a191d302fcfc2ff7320fdd54ca664.png",
    "https://i.pinimg.com/474x/0f/e9/bb/0fe9bba766201d818d6c5dea51a28957.jpg",
    "https://pbs.twimg.com/media/Fm2aVpnX0AEFzZv.png",
    "https://png.pngtree.com/png-vector/20231019/ourmid/pngtree-user-profile-avatar-png-image_10211471.png",
    "https://avatars.githubusercontent.com/u/15986930?v=4",
    "https://stereo-images.stereocdn.com/user-avatars/1608586655/orig.webp?1621523392",
  ];

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 300,
    bgcolor: "background.paper",
    border: "1px solid #000",
    boxShadow:
      "rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px !important",
    p: 4,
    display: "flex",
    alignItem: "center",
    borderRadius: "10px",
  };

  return (
    <div className="App">
      {modal ? (
        <Modal
          // style={{ borderRadius: "20px" }}
          keepMounted
          open={modal}
          onClose={handleModalClose}
          aria-labelledby="keep-mounted-modal-title"
          aria-describedby="keep-mounted-modal-description"
        >
          <Box sx={style}>
            <TextField
              id="userId"
              onChange={(e) => setUserName(e.target.value)}
              label="Create user id"
              variant="outlined"
            />
            <Button
              style={{ marginLeft: "20px" }}
              variant="contained"
              onClick={handleUserNameSubmit}
            >
              Enter
            </Button>
          </Box>
        </Modal>
      ) : (
        <>
          <div style={{ marginTop: "20px", fontSize: "28px" }}>
            {/* My id: {myId} */}
            Hello <b>{userName}</b>
            {/* <CopyToClipboard
              text={myId}
              onCopy={() => {
                setCopyText("Copied");
                setTimeout(() => {
                  setCopyText("Copy");
                }, 1500);
              }}
            >
              <Button variant="outlined" style={{ marginLeft: "10px" }}>
                {copyText}
              </Button>
            </CopyToClipboard> */}
          </div>
          {callAccepted && !callEnded ? (
            <RemoteVideo
              leaveCall={leaveCall}
              callEnded={callEnded}
              videoRef={callerVideo}
            />
          ) : (
            ""
          )}
          <VideoPreview videoRef={localVideo} />
          {!callAccepted ? (
            <div className="caller-id-and-button-container">
              <TextField
                id="callid"
                // onChange={(e) => setIdToCall(e.target.value)}
                label="Enter Your Friend Call ID"
                variant="outlined"
              />
              {/* <TextField
                id="user name"
                onChange={(e) => setName(e.target.value)}
                label="Name"
                variant="outlined"
              /> */}
              <Button
                variant="contained"
                onClick={() => {
                  callUser(idToCall);
                  setCallText("Calling...");
                  setTimeout(() => {
                    setCallText("Call");
                  }, 30000);
                }}
              >
                {callText}
              </Button>
              {receivingCall ? (
                <Button variant="contained" onClick={() => answerCall()}>
                  {name} is calling....
                </Button>
              ) : (
                ""
              )}

              <div style={{ padding: "20px" }}>
                <Typography
                  variant="h5"
                  gutterBottom
                  style={{
                    marginBottom: "20px",
                    textAlign: "left",
                    marginTop: "50px",
                  }}
                >
                  Online Users
                </Typography>
                <Grid container spacing={2}>
                  {onlineUsers.length > 0 ? (
                    onlineUsers.map((user, index) => (
                      <Grid
                        item
                        key={index}
                        xs={4}
                        sm={4}
                        md={3}
                        lg={3}
                        style={{ textAlign: "center" }}
                      >
                        <Avatar
                          alt={user}
                          src={
                            avatarPlaceholder[
                              index % avatarPlaceholder.length
                            ] || user
                          }
                          style={{
                            border: "1px solid black",
                            width: 60,
                            height: 60,
                            margin: "auto",
                            backgroundColor: user.image ? "" : getRandomColor(), // Use random color if no image
                          }}
                        />
                        <Typography
                          variant="subtitle1"
                          style={{ marginTop: "10px" }}
                        >
                          {user}
                        </Typography>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography variant="body1">
                        No users are currently online.
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </div>
            </div>
          ) : (
            ""
          )}
        </>
      )}
    </div>
  );
}

export default App;
