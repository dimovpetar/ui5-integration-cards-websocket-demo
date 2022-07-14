
const http = require("http");
const static = require("node-static");
const path = require("path");
const file = new static.Server(path.join(__dirname, "../client"));
const PORT = 3000;

const httpServer = http.createServer();

// Serve static files from the "client" folder
httpServer.on("request", (req, res) => {
	req.addListener("end", () => file.serve(req, res)).resume();
});

httpServer.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

// Init the web socket server on top of the http server
require("./sockets").createWebSocketServer(httpServer);