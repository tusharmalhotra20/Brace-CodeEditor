const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const ACTIONS = require("./src/Actions");

const server = http.createServer(app);

const io = new Server(server);

// ------------------- DEPLOYMENT -------------------------

app.use(express.static("build"));

app.use("*", (req, res, next) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// ------------------- DEPLOYMENT -------------------------

// For storing joiners 'socketId' and 'username' in an dynamic object.
// Since this mapping is stored inside the memory, if server restarts anyone who joined the room will be kicked out.
// For production level application, the above problem needs to be addressed by using in-memory database like- redis, storing users in db or in a file.
const userSocketMap = {};

// e.g. mapping
// {
//    "djkhdsl-skljaa": Tushar Malhotra
// }

function getAllConnectedClients(roomId) {
  // This 'io.sockets.adapter.rooms.get(roomId)' will return a 'Map' that is converted to an Array
  // If no user is connected return an empty array.

  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    }
  );
}
// This will trigger whenever a socket connection is established.
io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  // 'roomId' and 'username' received from frontend.
  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId); // this will create a new socket if not exists; else anyone who requests to join, socket.io will add that user to this room.

    // For notifying, that a new client has joined the room.
    const clients = getAllConnectedClients(roomId);
    // console.log(clients);

    clients.forEach(({ socketId }) => {
      // Notify to whom? Everyone who is present in the room.
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
    socket.leave();
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server started on PORT ${PORT}`);
});

// This won't work with socke.io
// app.listen(PORT, () => {
//   console.log(`Server started on PORT ${PORT}`);
// });
