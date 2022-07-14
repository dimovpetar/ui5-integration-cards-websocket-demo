const WebSocketServer = require("websocket").server;
const WebSocketRouter = require("websocket").router;
const { orderRandomProduct, getLatestOrders, getLatestOrderByCategory } = require("./services/Products");

const clientsConnections = new Map();

async function startDataGeneration() {
	await orderRandomProduct();

	clientsConnections.forEach((byCategory, connection) => {
		if (byCategory) {
			sendMessageToClient(connection, getLatestOrderByCategory());
		} else {
			sendMessageToClient(connection, getLatestOrders());
		}
	});

	setTimeout(startDataGeneration, 500 + Math.random() * 5000);
}

function sendMessageToClient(connection, data) {
	if (!connection.connected) {
		console.log("Connection is already closed");
		return false;
	}

	connection.sendUTF(JSON.stringify(data));

	return true;
}

function isOriginAllowed(origin) {
	// put logic here to detect whether the specified origin is allowed.
	return true;
}

function createWebSocketServer (httpServer) {
	const wsServer = new WebSocketServer({
		httpServer: httpServer,
		// You should not use autoAcceptConnections for production
		// applications, as it defeats all standard cross-origin protection
		// facilities built into the protocol and the browser.  You should
		// *always* verify the connection"s origin and decide whether or not
		// to accept it.
		autoAcceptConnections: false
	});

	const wsRouter = new WebSocketRouter({
		server: wsServer
	});

	wsRouter.mount("/byCategory", null, function (request) {
		// Make sure we only accept requests from an allowed origin
		if (!isOriginAllowed(request.origin)) {
			request.reject();
			console.log((new Date()) + "Path: '/byCategory'. Connection from origin " + request.origin + " rejected.");
			return;
		}
	
		const connection = request.accept(request.origin);
		console.log((new Date()), "Path: '/byCategory'. Connection accepted.", connection.remoteAddress);

		// For simplicity just preserve the connection, do not store user name or id
		clientsConnections.set(connection, true);

		connection.on("message", function(message) {
			if (message.type === "utf8") {
				console.log("Received message: " + message.utf8Data);
			} else {
				console.log("Received unknown message type");
			}
		});
	
		connection.on("close", function(reasonCode, description) {
			console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
			clientsConnections.delete(connection);
		});

		sendMessageToClient(connection, getLatestOrderByCategory());
	});

	wsRouter.mount("/", null, function (request) {
		// Make sure we only accept requests from an allowed origin
		if (!isOriginAllowed(request.origin)) {
			request.reject();
			console.log((new Date()), "Path: '/'. Connection from origin " + request.origin + " rejected.");
			return;
		}

		const connection = request.accept(request.origin);
		console.log((new Date()), "Path: '/'. Connection accepted.", connection.remoteAddress);

		// For simplicity just preserve the connection, do not store user name or id
		clientsConnections.set(connection, false);

		connection.on("message", function(message) {
			if (message.type === "utf8") {
				console.log("Received message: " + message.utf8Data);
			} else {
				console.log("Received unknown message type");
			}
		});
	
		connection.on("close", function(reasonCode, description) {
			console.log((new Date()) + "Path: '/'. Peer " + connection.remoteAddress + " disconnected.");
			clientsConnections.delete(connection);
		});

		sendMessageToClient(connection, getLatestOrders());
	});

	startDataGeneration();
}

module.exports = {
	createWebSocketServer
}