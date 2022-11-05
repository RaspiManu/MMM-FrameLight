/* Magic Mirror
 * node_helper.js
 *
 * By RaspiManu & ViatorisBaculum
 * https://github.com/RaspiManu/MMM-FrameLight
 * MPL-2.0 licensed
 */
"use strict";
let NodeHelper = require("node_helper");
const fs = require("fs");
const fetch = require("node-fetch");

let { PythonShell } = require("python-shell");

const pythonScriptName = "/MMM-FrameLight_LED_Control.py";
const configFile = "/presets/color_presets.JSON";

const options = {
	mode: "binary",
	pythonOptions: ["-u"]
};

let pyshell;

module.exports = NodeHelper.create({
	start: function () {
		this.started = true;
	},

	stop: function () {
		this.sendSocketNotification("shuttingDown", true);

		this.pythonStop();
	},

	/**
	 * initialize python shell
	 */
	pythonStart: function () {
		pyshell = new PythonShell(this.path + pythonScriptName, options);
	},

	/**
	 * stop old shell, initialize new one and send payload to script
	 * @param {object} payload
	 */
	pythonSend: function (payload) {
		this.pythonStop();

		pyshell = new PythonShell(this.path + pythonScriptName, options);

		pyshell.send(JSON.stringify(payload)).end(function (err, code, signal) {
			if (err) throw err;
		});
	},

	/**
	 * stop python shell
	 */
	pythonStop: function () {
		pyshell.kill("SIGTERM");
	},

	/**
	 * receives socket from main module
	 * @param {string} notification name of the socket
	 * @param {string} payload could contain object or presets
	 */
	socketNotificationReceived: function (notification, payload) {
		if (notification === "CONFIG") {
			// set config from payload
			if (!this.started) {
				this.config = payload;
			}
			this.pythonStart();
		}

		const presetPath = this.path + configFile;

		if (notification === "saveJSON") {
			// save json preset file
			fs.writeFile(presetPath, payload, function (err) {
				if (err) return console.log(err);
			});
		}

		/**
		 * writes into json when file exists | catches "no file" error and creates new json
		 */
		function createFileIfMissing() {
			fs.promises.writeFile(presetPath, "", { flag: "w" }).catch((err) => console.log(err));
		}

		if (notification === "openJSON") {
			// open json
			fs.promises
				.readFile(presetPath, "utf8")
				.then((ledPresets) => {
					if (ledPresets === "") {
						// if file is empty create new json with given presets anyway
						createFileIfMissing();
					}

					this.sendSocketNotification("ledPresets", ledPresets);
				})
				.catch((err) => {
					if (err.code === "ENOENT")
						// if error "no file" create new json
						createFileIfMissing();
					else console.log(err);
				});
		}

		if (notification === "createJSON") {
			// if creating file is explicitly demanded -> creating new file
			createFileIfMissing();
		}

		if (notification === "sendToPy") {
			// sends payload(sent object) to py
			this.pythonSend(payload);
		}
	},

	checkForExecError: function (error, stdout, stderr) {
		if (stderr) {
			console.log('stderr: "' + stderr + '"');
			return 1;
		}
		if (error !== null) {
			console.log("exec error: " + error);
			return 1;
		}
		return 0;
	}
});
