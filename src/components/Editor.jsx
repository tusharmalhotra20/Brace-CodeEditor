import React, { useEffect, useRef } from "react";
import Codemirror from "codemirror";
import "codemirror/theme/dracula.css"; //loading css from codemirror for editor theme
import "codemirror/lib/codemirror.css"; //loading css from codemirror for codemirror
import "codemirror/mode/javascript/javascript"; //loading JS mode from codemirror to write JS in codemirror
import "codemirror/addon/edit/closetag"; //loading autoCloseTags from codemirror
import "codemirror/addon/edit/closebrackets";
import ACTIONS from "../Actions";

const Editor = ({ socketRef, roomId, onCodeChange }) => {
  const editorRef = useRef(null);
  // initializing code editor using useEffect
  useEffect(() => {
    async function init() {
      // Storing editor's Reference
      editorRef.current = Codemirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          mode: { name: "javascript", json: true },
          theme: "dracula",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
        }
      );

      // Calling 'change' event on codemirror
      editorRef.current.on("change", (instance, changes) => {
        // 'origin' attribute found in 'change' event, is used to select which type of change we want to sync. like +input, paste, cut, etc.
        const { origin } = changes;

        // Getting code written in the editor from instance of the editor.
        const code = instance.getValue();
        onCodeChange(code);
        
        if (origin !== "setValue") {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code });
        }
      });
    }
    init(); //calling
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }
    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef.current]);

  return (
    <div>
      <textarea id="realtimeEditor"></textarea>
    </div>
  );
};

export default Editor;
