import { useState, useEffect, useRef } from "react";
import RemoteVideo from "./components/remoteVideo";
import VideoPreview from "./components/localVideo";
import "./App.css";
import io from "socket.io-client";
import Peer from "simple-peer";
import { Button, TextField } from "@mui/material";
import CopyToClipboard from "react-copy-to-clipboard";
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

  const localVideo = useRef();
  const callerVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    // get video and audio
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream); // Store the local video stream in state for further use
        if (localVideo.current) localVideo.current.srcObject = currentStream; // Show user's camera feed on the page
      });

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
  }, []);

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
        from: myId,
        name: name,
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
  return (
    <div className="App">
      <div style={{ marginTop: "20px" }}>
        My id: {myId}
        <CopyToClipboard
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
        </CopyToClipboard>
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
      {/* <RemoteVideo videoRef={callerVideo} /> */}
      {stream ? <VideoPreview videoRef={localVideo} /> : ""}
      {/* <VideoPreview videoRef={localVideo} /> */}
      {!callAccepted ? (
        <div className="caller-id-and-button-container">
          <TextField
            id="callid"
            onChange={(e) => setIdToCall(e.target.value)}
            label="Enter Call ID"
            variant="outlined"
          />
          <TextField
            id="user name"
            onChange={(e) => setName(e.target.value)}
            label="Name"
            variant="outlined"
          />
          <Button variant="contained" onClick={() => callUser(idToCall)}>
            Call
          </Button>
          {receivingCall ? (
            <Button variant="contained" onClick={() => answerCall()}>
              Answer Call
            </Button>
          ) : (
            ""
          )}
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default App;
