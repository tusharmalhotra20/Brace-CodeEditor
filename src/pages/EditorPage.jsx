import React, { useState, useRef, useEffect } from "react";
import ACTIONS from "../Actions";
import Client from "../components/Client";
import Editor from "../components/Editor";
import { initSocket } from "../socket";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import toast from "react-hot-toast";

const EditorPage = () => {
  // To get the state, on redirecting from HomePage to EditorPage
  const location = useLocation();

  // To get the roomId from the URL, using 'useParams' hook
  const { roomId } = useParams();

  // Initialization of socket connection by creating a 'socketRef' and store in it; also call event emitter on it.
  // useRef is used to store data, which should be available at multiple render, without rendering the component on its change unlike in useState.
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const reactNavigator = useNavigate();
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const init = async () => {
      // Trying to establishing a connection by calling instance of 'client-socket' and storing it in 'socketRef.current'
      socketRef.current = await initSocket();

      // On Fail:
      // To establish connection: WebSockets error handling
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(e) {
        console.log("socket error", e);
        toast.error("Socket connection failed, try again later.");
        reactNavigator("/");
      }
      // On Success:
      // On joining, we are emitting a JOIN event; which we have to listen on the server.
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        // Optional chaining for safe and concise way to perform access checks for nested object properties.
        // If 'location.state?.username' is not found in the state, username: 'sets to undefined' instead of throwing err.
        username: location.state?.username,
      });

      // Listening for JOINED event
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room.`);
            console.log(`${username} joined.`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      // Listening for DISCONNECTED event
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room.`);
        setClients((prev) => {
          return prev.filter((client) => {
            return client.socketId !== socketId;
          });
        });
      });
    };
    init(); // calling above func()

    return () => {
      // Clearing the listeners, to avoid memory leak.
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOIN);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    };
  }, []);

  const handleCopyRoomID = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("ROOM ID copied to clipboard");
    } catch (error) {
      toast.error("Could not copy the ROOM ID");
      console.error(error);
    }
  };

  const handleLeave = () => {
    // <Prompt message="Are you sure you want to leave?" />;
    reactNavigator("/");
  };

  // If 'username' is 'undefined' in the state while redirecting from Home to Editor page.
  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <div className="mainWrap">
        <div className="aside">
          <div className="asideInner">
            <div className="logo">
              <img
                src="/code-editor-logo.png"
                alt="logo"
                className="logoImage"
                draggable="false"
              />
            </div>
            <h3>Connected</h3>
            <div className="clientList">
              {clients.map((client) => {
                return (
                  <Client key={client.socketId} username={client.username} />
                );
              })}
            </div>
          </div>
          <button className="btn copyBtn" onClick={handleCopyRoomID}>
            Copy Room ID
          </button>
          <button className="btn leaveBtn" onClick={handleLeave}>
            Leave
          </button>
        </div>

        <div className="editorWrap">
          <Editor
            socketRef={socketRef}
            roomId={roomId}
            onCodeChange={(code) => {
              codeRef.current = code;
            }}
          />
        </div>
      </div>
    </>
  );
};

export default EditorPage;
