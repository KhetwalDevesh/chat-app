import { io } from "socket.io-client";
import Header from "./components/Header";
import Home from "./pages/Home";

const socket = io("http://localhost:8000");

function App() {
	return (
		<div>
			<Header />
			<Home socket={socket} />
		</div>
	);
}

export default App;
