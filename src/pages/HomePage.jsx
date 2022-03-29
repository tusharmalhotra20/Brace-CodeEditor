import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  // to set roomId in the input field.
  const [roomId, setRoomId] = useState("");

  // to set username in the input field
  const [username, setUsername] = useState("");

  const navigate = useNavigate();

  const createNewRoom = (e) => {
    // to prevent page from reloading on creating room
    e.preventDefault();

    const id = uuidv4();
    setRoomId(id);

    toast.success("New room created");
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("ROOM ID & USERNAME is required!");
      return;
    }
    // Regular expression to check if string is a valid UUID
    const regexExp =
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

    if (!regexExp.test(roomId)) {
      toast.error("Enter a valid ROOM ID!");
      return;
    }

    // Redirect to EditorPage
    navigate(`/editor/${roomId}`, {
      // sending data from 'Home route' to 'EditorPage route'
      state: {
        username,
      },
    });
  };

  // to enable user to be redirected on editor's page on hitting enter without clicking on join button.
  const handleInputEnter = (e) => {
    // console.log(e.code);
    if (e.code === "Enter" || e.code === "NumpadEnter") {
      joinRoom();
    }
  };

  return (
    <>
      <div className="homePageWrapper">
        <div className="formWrapper">
          <img
            src="/code-editor-logo.png"
            alt="brace-code-editor-logo"
            className="homePageLogo"
            draggable="false"
          />
          <h4 className="mainLabel">Paste invitation ROOM ID</h4>
          <div className="inputGroup">
            <input
              value={roomId}
              type="text"
              className="inputBox"
              placeholder="ROOM ID"
              onChange={(e) => {
                // to make this input field a controlled input
                setRoomId(e.target.value);
              }}
              onKeyUp={handleInputEnter}
            />
            <input
              value={username}
              type="text"
              className="inputBox"
              placeholder="USERNAME"
              onChange={(e) => {
                // to make this input field a controlled input
                setUsername(e.target.value);
              }}
              onKeyUp={handleInputEnter}
            />
            <button className="btn joinBtn" onClick={joinRoom}>
              Join
            </button>
            <span className="createInfo">
              Don't have an invite? create &nbsp;
              <a onClick={createNewRoom} href="" className="createNewBtn">
                new room
              </a>
            </span>
          </div>
        </div>
        <footer>
          <h4>
            Built with &hearts; by &nbsp;
            <a href="https://github.com/tusharmalhotra20">Tushar Malhotra</a>
          </h4>
        </footer>
      </div>
    </>
  );
};

export default HomePage;
