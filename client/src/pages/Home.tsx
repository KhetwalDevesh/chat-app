/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useEffect } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface RoomDataProps {
	room_name: string;
	username: string;
}

const Home = ({ socket }) => {
	const [value, setQuillValue] = useState("");
	const [currentRoom, setCurrentRoom] = useState<string>("");
	const [username, setUsername] = useState<string>("");
	const [isLoggedinInCurrentRoom, setIsLoggedinInCurrentRoom] =
		useState<boolean>(false);
	const { register, handleSubmit, setValue, reset } = useForm<RoomDataProps>();
	const [chats, setChats] = useState<IChat>([]);

	const onSubmitRoomname = (roomData: RoomDataProps) => {
		try {
			setValue("room_name", "");
			setValue("username", "");
			if (roomData.room_name === "" || roomData.username === "") {
				return;
			}
			const roomId = uuidv4();
			console.log(
				"roomData.room_name",
				JSON.stringify(roomData.room_name, null, 2)
			);
			setCurrentRoom(roomData.room_name);
			setUsername(roomData.username);
			socket.emit("join_room", roomData.room_name);
		} catch (error) {
			console.log(error);
		}
	};

	const sendMessage = async (messageData: IChat) => {
		if (currentRoom === "" || username === "") {
			return <div>Join room to start the chat</div>;
		}

		if (messageData.message !== "") {
			const messageDetail = {
				id: uuidv4(),
				room: currentRoom,
				author: username,
				message: messageData.message,
				time:
					new Date(Date.now()).getHours() +
					":" +
					new Date(Date.now()).getMinutes(),
			};
			console.log("messageData", JSON.stringify(messageData, null, 2));
			console.log("username", JSON.stringify(username, null, 2));
			await socket.emit("send_message", messageDetail);
			setChats((list) => [...list, messageDetail]);
			setValue("message", "");
		}
	};

	useEffect(() => {
		console.log("currentRoom", JSON.stringify(currentRoom, null, 2));
		console.log(
			"isLoggedinInCurrentRoom",
			JSON.stringify(isLoggedinInCurrentRoom, null, 2)
		);

		socket.on("receive_message", (data) => {
			console.log("data", JSON.stringify(data, null, 2));
			setChats((list) => [...list, data]);
		});
	}, [socket]);

	return (
		<div className="flex">
			<div className="bg-[#f0f2f5] min-h-screen w-full  absolute flex">
				<div className="left border-r-2 border-gray-400 flex-1 bg-[#f0f2f5]">
					<div className="border-b-[2px] border-gray-400 h-[102px] bg-[#f0f2f5] p-4 flex flex-col justify-center items-center">
						<div>
							<form
								onSubmit={handleSubmit(onSubmitRoomname)}
								className="flex gap-2">
								<input
									className="p-1 border-2  rounded-md border-black "
									placeholder="enter user name"
									{...register("username")}
								/>
								<input
									className="p-1 border-2  rounded-md border-black "
									placeholder="enter room name"
									{...register("room_name")}
								/>
								<input
									className="send-button px-3 py-1 ml-1 text-sm bg-black rounded-md text-white cursor-pointer active:translate-y-2"
									type="submit"
									value="Join Room"
								/>
							</form>
						</div>
					</div>
					<div className="overflow-y-auto h-[80vh]">
						<div className="flex flex-col">
							{currentRoom === "" ? (
								<div className="flex items-center justify-center h-[60vh]">
									<span className="text-3xl font-medium text-gray-600">
										Enter a room to start the chat!
									</span>
								</div>
							) : (
								<div
									id="chat-container"
									className="h-[60vh] border-b-2 border-gray-400 overflow-y-auto p-1 py-2">
									{chats.map((chat) => {
										console.log("chats", JSON.stringify(chats, null, 2));
										return (
											<div key={chat.id} className="w-[100%]">
												{chat.author === username ? (
													<div
														key={chat.id}
														className="flex h-full justify-end">
														<div className="w-1/2 flex justify-end">
															<div className="mx-4 mb-1 p-2 border-2 max-w-[100%] border-gray-400 flex justify-start bg-[#c5e6c1] rounded-t-lg rounded-br-lg">
																<div className="max-w-[100%] h-[100%] break-words flex flex-col">
																	<span>{chat.message}</span>
																	<span className="text-xs justify-end flex text-gray-500">
																		You
																	</span>
																	<span className="text-xs justify-end flex text-gray-500">
																		{chat.time}
																	</span>
																</div>
															</div>
														</div>
													</div>
												) : (
													<div
														key={chat.id}
														className="flex  mx-4 mb-1  w-1/2  rounded-t-lg rounded-br-lg">
														<div className="mx-4  p-2 border-2 max-w-[100%] flex justify-start bg-slate-300 rounded-t-lg rounded-br-lg">
															<div className="max-w-[100%] h-[100%] break-words flex flex-col">
																<span className="">{chat.message}</span>
																<span className="text-xs justify-end flex text-gray-500">
																	{chat.author}
																</span>
																<span className="text-xs justify-end flex text-gray-500">
																	{chat.time}
																</span>
															</div>
														</div>
													</div>
												)}
											</div>
										);
									})}
								</div>
							)}
							<div className="p-6 flex items-center justify-center h-[20vh]">
								<form className="" onSubmit={handleSubmit(sendMessage)}>
									<ReactQuill
										theme="snow"
										value={value}
										onChange={setQuillValue}
									/>
									<input
										className="p-1 border-2 w-[40vw] h-[10vh] rounded-md border-black "
										placeholder="message"
										{...register("message")}
									/>
									<input
										className="send-button px-3 py-1 m-2 w-[6rem] h-[3rem] bg-black rounded-md text-white cursor-pointer active:translate-y-2"
										type="submit"
										value="Enter"
									/>
								</form>
							</div>
						</div>
						{/* {rooms.map((room) => {
							console.log("room", JSON.stringify(room, null, 2));
							return (
								<div
									onClick={() => {
										setCurrentRoom(room.name);
										if (room.name !== currentRoom) {
											setIsLoggedinInCurrentRoom(false);
										}
									}}
									key={room.id}
									className={`flex justify-center items-center h-[80px] border-b-[2px] border-gray-400 cursor-pointer 
									${room.name === currentRoom ? `bg-white` : `bg-[#f0f2f5]`}`}>
									<div>{room.name}</div>
								</div>
							);
						})} */}
					</div>
				</div>
				{/* <div className="right  w-[100%]  flex-[2]">
					<div>
						<div className="h-[102px] border-b-2 border-gray-400 flex items-center pl-[20px]">
							{currentRoom}
						</div>
						{currentRoom === "" ? (
							// <div className="flex items-center justify-center h-[80vh]">
							// 	<span className="text-3xl font-medium text-gray-600">
							// 		Enter a room to start the chat!
							// 	</span>
							// </div>
							<div></div>
						) : (
							<div>
								{isLoggedinInCurrentRoom ? (
									// <Chat
									// 	isLoggedinInCurrentRoom={isLoggedinInCurrentRoom}
									// 	currentRoom={currentRoom}
									// 	username={myUsername}
									// 	socket={socket}
									// 	chats={chats}
									// 	setChats={setChats}
									// />
									<div></div>
								) : (
									<div>
										<div className="flex flex-col justify-center items-center  gap-2 h-[80vh]">
											<span>Want to join the room? Enter your username</span>
											<form
												className="flex gap-2"
												onSubmit={handleSubmit(onSubmitUsername)}>
												<input
													className="p-1 border-2 rounded-md border-black "
													placeholder="username"
													{...register("username")}
												/>
												<input
													className="send-button px-3 py-1 bg-black rounded-md text-white cursor-pointer active:translate-y-2"
													type="submit"
													value="Enter"
												/>
											</form>
										</div>
									</div>
								)}
							</div>
						)}
					</div>
				</div> */}
			</div>
		</div>
	);
};

export default Home;