/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useEffect } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import Editor from "../components/Editor";

const Home = ({ socket }) => {
	const [value, setQuillValue] = useState("");
	const [currentRoom, setCurrentRoom] = useState("");
	const [username, setUsername] = useState("");
	const [isLoggedinInCurrentRoom, setIsLoggedinInCurrentRoom] = useState(false);
	const { register, handleSubmit, setValue, reset } = useForm();
	const [chats, setChats] = useState([]);
	const [updated, setUpdated] = useState(false);
	const [editorText, setEditorText] = useState("");

	const onSubmitRoomname = (roomData) => {
		try {
			setValue("room_name", "");
			setValue("username", "");
			if (roomData.room_name === "" || roomData.username === "") {
				return;
			}
			const roomId = uuidv4();
			setCurrentRoom(roomData.room_name);
			setUsername(roomData.username);
			socket.emit("join_room", roomData.room_name);
		} catch (error) {
			console.log(error);
		}
	};

	const sendMessage = async (messageData) => {
		if (currentRoom === "" || username === "") {
			return <div>Join room to start the chat</div>;
		}

		if (messageData.message !== "") {
			const messageDetail = {
				id: uuidv4(),
				room: currentRoom,
				author: username,
				message: messageData.message,
				datatype: typeof messageData.message,
				time:
					new Date(Date.now()).getHours() +
					":" +
					new Date(Date.now()).getMinutes(),
			};

			await socket.emit("send_message", messageDetail);
			setChats((list) => [...list, messageDetail]);
			setValue("message", "");
		}
	};

	useEffect(() => {
		socket.on("receive_message", (data) => {
			setChats((list) => [...list, data]);
		});

		socket.on("receiveFile", (data) => {
			setChats((list) => [...list, data]);
			const file = data.file;
			const fileName = data.fileName;

			const fileBlob = new Blob([file]);
			const fileType = fileBlob.type;
			const fileURL = URL.createObjectURL(fileBlob);

			const downloadLink = document.createElement("a");
			downloadLink.href = fileURL;
			downloadLink.download = fileName;
			downloadLink.textContent = "Download File";
			document.body.appendChild(downloadLink);
			setUpdated(true);
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
										const fileBlob = new Blob([chat.file]);
										const fileType = fileBlob.type;

										if (chat.datatype !== "string") {
											const fileExtension = chat?.fileName?.split(".");
											if (
												fileExtension[1] === "png" ||
												fileExtension[1] === "jpeg" ||
												fileExtension[1] === "jpg"
											) {
												if (
													document?.getElementById(`chat-img-${chat.id}`)
														?.children?.length === 0
												) {
													const imageElement = document.createElement("img");
													imageElement.src = URL.createObjectURL(fileBlob);
													imageElement.width = 100;
													imageElement.height = 100;
													document
														?.getElementById(`chat-img-${chat.id}`)
														?.appendChild(imageElement);
												}
											} else {
												if (
													document?.getElementById(`chat-pdf-${chat.id}`)
														?.children?.length === 0
												) {
													const fileURL = URL.createObjectURL(fileBlob);
													const downloadLink = document.createElement("a");
													downloadLink.href = fileURL;
													downloadLink.download = chat.fileName;
													downloadLink.textContent = "Download File";
													document
														?.getElementById(`chat-pdf-${chat.id}`)
														?.appendChild(downloadLink);
												}
											}
										}

										return (
											<div key={chat.id}>
												{chat.datatype === "string" ? (
													<div key={chat.id} className="w-[100%]">
														{chat.author === username ? (
															<div
																key={chat.id}
																className="flex h-full justify-end">
																<div className="w-1/2 flex justify-end">
																	<div className="mx-4 mb-1 p-2 border-2 max-w-[100%] border-gray-400 flex justify-start bg-[#c5e6c1] rounded-t-lg rounded-br-lg">
																		<div className="max-w-[100%] h-[100%] break-words flex flex-col">
																			<span
																				dangerouslySetInnerHTML={{
																					__html: chat.message,
																				}}
																			/>
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
																		<span
																			dangerouslySetInnerHTML={{
																				__html: chat.message,
																			}}
																		/>
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
												) : (
													<div>
														{
															<div key={chat.id} className="w-[100%]">
																{chat.author === username ? (
																	<div
																		key={chat.id}
																		className="flex h-full justify-end">
																		<div className="w-1/2 flex justify-end">
																			<div className="mx-4 mb-1 p-2 border-2 max-w-[100%] border-gray-400 flex justify-start bg-[#c5e6c1] rounded-t-lg rounded-br-lg">
																				<div className="max-w-[100%] h-[100%] break-words flex flex-col">
																					<div
																						className=""
																						id={`chat-img-${chat.id}`}></div>
																					<div
																						className=""
																						id={`chat-pdf-${chat.id}`}></div>
																					<span className="">
																						{chat.fileName}
																					</span>
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
																				<div
																					className=""
																					id={`chat-img-${chat.id}`}></div>
																				<div
																					className=""
																					id={`chat-pdf-${chat.id}`}></div>
																				<span className="">
																					{chat.fileName}
																				</span>
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
														}
													</div>
												)}
											</div>
										);
									})}
								</div>
							)}
							<div className="p-6 flex items-center justify-center h-[20vh] border-t-2 border-gray-400">
								<Editor
									socket={socket}
									currentRoom={currentRoom}
									username={username}
									chats={chats}
									setChats={setChats}
									editorText={editorText}
									setEditorText={setEditorText}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Home;
