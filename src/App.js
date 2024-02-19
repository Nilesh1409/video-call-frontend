import { useState, useEffect, useRef } from "react";
import RemoteVideo from "./components/remoteVideo";
import VideoPreview from "./components/localVideo";
import "./App.css";
import io from "socket.io-client";
import Peer from "simple-peer";
import { Button, TextField } from "@mui/material";
import CopyToClipboard from "react-copy-to-clipboard";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
// import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
const socket = io("https://video-calling-backend-e4yf.onrender.com"); // change to your server address if needed
// const socket = io("http://localhost:8080");
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

    peer.on("signal", (data) => {
      // Send signal data to the friend you want to call
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: userName,
        name: userName,
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
                onChange={(e) => setIdToCall(e.target.value)}
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
