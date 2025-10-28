import { io } from "socket.io-client";


export const socket = io("https://jsramverk-mapg23-e4hebqhcfxbpcbey.northeurope-01.azurewebsites.net", {
  autoConnect: false, // prevent premature connect
  withCredentials: true,
});
