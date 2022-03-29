import { io } from "socket.io-client";

export const initSocket = async () => {
  const options = {
    "force new connection": true,
    reconnectionAttempt: "Infinity",
    timeout: 10000,
    transports: ["websocket"],
  };
  // No need to install 'dotenv' package as it comes with react-app (default); just need to add REACT_APP_ as prefix to configure environmenet variable.
  // returning instance of 'client-socket'
  return io(process.env.REACT_APP_BACKEND_URL, options);
};
