import React, { useState, useEffect } from "react";
import io from "socket.io-client";
const ENDPOINT = "http://127.0.0.1:5000";

function App() {
  const [text, setText] = useState("");

  useEffect(() => {
    const socket = io(ENDPOINT);

    console.log(socket.id)
    socket.on("connect", data => {
        setText('connected')
    });

    socket.on("connection response", data => {
       setText(data.data)
    })
  }, []);

  return (
      <p>
          {text}
      </p>
    
  );
}

export default App;