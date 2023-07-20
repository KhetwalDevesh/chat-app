import { Color } from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import "../index.css";
import Placeholder from "@tiptap/extension-placeholder";
import {
	AiOutlineBold,
	AiOutlineItalic,
	AiOutlineStrikethrough,
	AiFillPlusCircle,
} from "react-icons/ai";

import { BsLink45Deg, BsEmojiSmile } from "react-icons/bs";

import { PiListBulletsFill } from "react-icons/pi";

import { MdOutlineFormatListNumbered } from "react-icons/md";

import { GrBlockQuote } from "react-icons/gr";

import { BiCodeAlt, BiCodeBlock } from "react-icons/bi";

import { GoMention } from "react-icons/go";

import { IoSend } from "react-icons/io5";

import Link from "@tiptap/extension-link";
import { useCallback, useState } from "react";
import Mention from "@tiptap/extension-mention";

import SocketIOFileUpload from "socketio-file-upload";

import { v4 as uuidv4 } from "uuid";

const MenuBar = ({ editor }) => {
	if (!editor) {
		return null;
	}

	const setLink = useCallback(() => {
		const previousUrl = editor?.getAttributes("link").href;
		const url = window.prompt("URL", previousUrl);

		// cancelled
		if (url === null) {
			return;
		}

		// empty
		if (url === "") {
			editor?.chain().focus().extendMarkRange("link").unsetLink().run();
			return;
		}

		// update link
		// editor
		// 	?.chain()
		// 	.focus()
		// 	.extendMarkRange("link")
		// 	.setLink({ href: url })
		// 	.run();

		editor.commands.setLink({ href: url, target: "_blank" });
	}, [editor]);

	if (!editor) {
		return null;
	}

	return (
		<div className="p-4 flex gap-3">
			<AiOutlineBold
				onClick={() => editor.chain().focus().toggleBold().run()}
				disabled={!editor.can().chain().focus().toggleBold().run()}
				className={
					editor.isActive("bold") ? "is-active bg-gray-600 rounded-sm" : ""
				}>
				bold
			</AiOutlineBold>
			<AiOutlineItalic
				onClick={() => editor.chain().focus().toggleItalic().run()}
				disabled={!editor.can().chain().focus().toggleItalic().run()}
				className={
					editor.isActive("italic") ? "is-active bg-gray-600 rounded-sm" : ""
				}>
				italic
			</AiOutlineItalic>
			<AiOutlineStrikethrough
				onClick={() => editor.chain().focus().toggleStrike().run()}
				disabled={!editor.can().chain().focus().toggleStrike().run()}
				className={
					editor.isActive("strike") ? "is-active bg-gray-600 rounded-sm" : ""
				}>
				strike
			</AiOutlineStrikethrough>
			<BsLink45Deg
				onClick={setLink}
				className={
					editor.isActive("link") ? "is-active bg-gray-600 rounded-sm" : ""
				}>
				setLink
			</BsLink45Deg>
			<PiListBulletsFill
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				className={
					editor.isActive("bulletList")
						? "is-active bg-gray-600 rounded-sm"
						: ""
				}>
				bullet list
			</PiListBulletsFill>
			<MdOutlineFormatListNumbered
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				className={
					editor.isActive("orderedList")
						? "is-active bg-gray-600 rounded-sm"
						: ""
				}>
				ordered list
			</MdOutlineFormatListNumbered>
			<GrBlockQuote
				onClick={() => editor.chain().focus().toggleBlockquote().run()}
				className={
					editor.isActive("blockquote")
						? "is-active bg-gray-600 rounded-sm"
						: ""
				}>
				blockquote
			</GrBlockQuote>
			<BiCodeAlt
				onClick={() => editor.chain().focus().toggleCode().run()}
				disabled={!editor.can().chain().focus().toggleCode().run()}
				className={
					editor.isActive("code") ? "is-active bg-gray-600 rounded-sm" : ""
				}>
				code
			</BiCodeAlt>
			<BiCodeBlock
				onClick={() => editor.chain().focus().toggleCodeBlock().run()}
				className={
					editor.isActive("codeBlock") ? "is-active bg-gray-600 rounded-sm" : ""
				}>
				code block{" "}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
					style={{
						width: 16,
						height: 16,
					}}>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
					/>
				</svg>
			</BiCodeBlock>
		</div>
	);
};

const MenuBar2 = ({
	editor,
	socket,
	currentRoom,
	username,
	chats,
	setChats,
	editorText,
	setEditorText,
}) => {
	const [inputFile, setInputFile] = useState();
	if (!editor) {
		return null;
	}

	let uploader = new SocketIOFileUpload(socket);
	const formData = new FormData();

	// uploader.listenOnInput(document.getElementById("siofu_input"));

	const uploadFile = (files) => {
		if (username === "" || currentRoom === "") {
			return;
		}
		const file = files[0];
		const reader = new FileReader();
		reader.onload = (e) => {
			const fileData = e.target.result;
			const messageDetail = {
				id: uuidv4(),
				room: currentRoom,
				author: username,
				datatype: typeof fileData,
				file: fileData,
				fileName: file.name,
				time:
					new Date(Date.now()).getHours() +
					":" +
					new Date(Date.now()).getMinutes(),
			};
			socket.emit("sendFile", messageDetail);
			setChats((list) => [...list, messageDetail]);
		};
		reader.readAsArrayBuffer(file);
	};

	const sendMessage = async () => {
		if (username === "" || currentRoom === "") {
			return;
		}
		const messageDetail = {
			id: uuidv4(),
			room: currentRoom,
			author: username,
			message: editorText,
			datatype: typeof editorText,
			time:
				new Date(Date.now()).getHours() +
				":" +
				new Date(Date.now()).getMinutes(),
		};
		await socket.emit("send_message", messageDetail);
		await setChats((list) => [...list, messageDetail]);
	};

	const handleFileChange = (e) => {
		formData.append("inputFile", e.target.files);
		uploadFile(e.target.files);
	};

	return (
		<div className="flex justify-between">
			<div className="p-4 flex gap-3">
				<input
					type="file"
					id="siofu_input"
					style={{ display: "none" }}
					// accept="image/*, .pdf, .docx"
					onChange={(e) => {
						handleFileChange(e);
					}}
				/>

				<label htmlFor="siofu_input">
					<AiFillPlusCircle></AiFillPlusCircle>
				</label>
				<BsEmojiSmile></BsEmojiSmile>
				<GoMention></GoMention>
			</div>
			<div className="flex items-center">
				<button
					className="flex justify-center items-center p-2 bg-[#00a884] rounded-md mr-2"
					onClick={() => {
						if (editor.getText() !== "") {
							sendMessage();
						}
					}}>
					<IoSend className="text-white"></IoSend>
				</button>
			</div>
		</div>
	);
};

const Editor = ({
	socket,
	currentRoom,
	username,
	chats,
	setChats,
	editorText,
	setEditorText,
}) => {
	const editor = useEditor({
		extensions: [
			Color.configure({ types: [TextStyle.name, ListItem.name] }),
			TextStyle.configure({ types: [ListItem.name] }),
			StarterKit.configure({
				bulletList: {
					keepMarks: true,
					keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
				},
				orderedList: {
					keepMarks: true,
					keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
				},
			}),
			Placeholder.configure({
				emptyEditorClass: "is-editor-empty",
				placeholder: "Chat comes here...",
			}),
			Link.configure({
				openOnClick: true,
			}),
		],
		editorProps: {
			attributes: {
				class:
					"prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 my-0 focus:outline-none  rounded-lg",
			},
		},
		content: `
      <div></div>
    `,
	});

	setEditorText(editor?.getHTML());

	return (
		<div className="border-2 rounded-md bg-black text-gray-400 w-[60vw]">
			<MenuBar editor={editor} />
			<EditorContent editor={editor} />
			<MenuBar2
				editor={editor}
				socket={socket}
				currentRoom={currentRoom}
				username={username}
				chats={chats}
				setChats={setChats}
				editorText={editorText}
				setEditorText={setEditorText}
			/>
		</div>
	);
};

export default Editor;
