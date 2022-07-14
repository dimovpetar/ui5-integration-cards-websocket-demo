sap.ui.define(["sap/ui/integration/Extension"], function (Extension) {
	"use strict";

	const DataExtension = Extension.extend("card.demo.websockets.DataExtension");

	DataExtension.prototype.onCardReady = function () {
		this._initWebSocket();

		this.attachAction(function (event) {
			alert("Get more details about category: " + event.getParameter("parameters").category);
		});
	};

	DataExtension.prototype.exit = function () {
		if (this._ws) {
			this._ws.close();
		}
	};

	DataExtension.prototype._initWebSocket = function () {
		this.getCard().resolveDestination("ProductsServiceByCategory")
			.then(function (url) {
				// Don't open the web socket connection if the card was destroyed while obtaining the auth token
				if (this.isDestroyed()) {
					return;
				}

				// In real environment authenticate as designed by the server
				this._ws = new WebSocket(url);

				// Listen for messages
				this._ws.addEventListener("message", function (event) {
					const data = JSON.parse(event.data);
					console.log("Message from server", data);
					this.getCard().getModel().setProperty("/", data);
				}.bind(this));
			}.bind(this));
	}

	return DataExtension;
});
