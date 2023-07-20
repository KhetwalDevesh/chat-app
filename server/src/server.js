import express from "express";
const app = express();
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import siofu from "socketio-file-upload";
import { writeFile } from "fs";
dotenv.config();
app.use(cors());
app.use(siofu.router).listen(8001);

const server = http.createServer(app);
// connectDB();

// app.use("/rooms", roomRouter);
// app.use("/users", userRouter);
// app.use("/chats", chatRouter);

const io = new Server(server, {
	cors: {
		origin: " http://localhost:5173",
		methods: ["GET", "POST"],
	},
	maxHttpBufferSize: 1e8,
});

io.on("connection", (socket) => {
	console.log(`User Connected: ${socket.id}`);

	socket.on("join_room", (data) => {
		socket.join(data);
		console.log(`User with ID: ${socket.id} joined room: ${data}`);
	});

	socket.on("send_message", (data) => {
		console.log("data", JSON.stringify(data, null, 2));
		socket.to(data.room).emit("receive_message", data);
	});

	socket.on("disconnect", () => {
		console.log("User Disconnected", socket.id);
	});

	socket.on("sendFile", (data) => {
		console.log("room", JSON.stringify(data.room, null, 2));
		console.log("author", JSON.stringify(data.author, null, 2));
		console.log("dataType", JSON.stringify(data.dataType, null, 2));
		console.log("filename", JSON.stringify(data.fileName, null, 2));
		socket.to(data.room).emit("receiveFile", data);
	});
});

server.listen(8000, () => {
	console.log("SERVER RUNNING");
});
