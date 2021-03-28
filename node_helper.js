/* Magic Mirror
 * node_helper.js
 *
 * By RaspiManu & ViatorisBaculum
 * https://github.com/RaspiManu/MMM-FrameLight
 * MIT Licensed.
 */
'use strict';
let NodeHelper = require("node_helper");
const fs = require("fs");
const fetch = require("node-fetch");

let {PythonShell} = require('python-shell');

const pythonScriptName = "/MMM-FrameLight_LED_Control.py";
const configFile = "/presets/color_presets.JSON";

module.exports = NodeHelper.create({
	start: function () {
		this.started = true;
	},

    /**
     * start python script with given params to light up leds
     * @param {object} object contains params for py
     */
    python_start: function (object) {
        const self = this;
        
        let options = {
            mode: 'binary',
            pythonOptions: ['-u'],
            args: [JSON.stringify(object)]
        };

        const pyshell = new PythonShell(self.path + pythonScriptName, options);
               
        pyshell.on('message', function (message) {
            console.log(message);
        });
    
        pyshell.end(function (err) {
        if (err) throw err;
          //console.log("[" + self.name + "] " + 'finished running...');
        });
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
            fs.promises
                .writeFile(presetPath, '', { flag: 'wx' })
                .catch((err) => console.log(err));   
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
                    if(err.code === 'ENOENT')
                        // if error "no file" create new json
                        createFileIfMissing();
                    else
                        console.log(err);
                });
		}

        if (notification === "createJSON") {
            // if creating file is explicitly demanded -> creating new file
            createFileIfMissing();
        }

        if (notification === "sendToPy") {
            // sends payload(sent object) to py
            this.python_start(payload);
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
