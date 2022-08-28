/* Magic Mirror
 * MMM-FrameLight.js
 *
 * By RaspiManu & ViatorisBaculum
 * https://github.com/RaspiManu/MMM-FrameLight
 * MPL-2.0 licensed
 */

Module.register("MMM-FrameLight", {
	defaults: {
		refreshInterval: 1000,
		ledContainer: "ledContainer",
		presets: {
			state: "off",
			activePreset: 2,
			color0: "rgb(0, 0, 0)",
			color1: "rgb(0, 0, 0)",
			color2: "rgb(255, 0, 0)",
			color3: "rgb(255, 0, 0)",
			color4: "rgb(255, 221, 0)",
			color5: "rgb(0, 0, 0)",
			color6: "rgb(255, 0, 0)",
			color7: "rgb(255, 0, 0)",
			color8: "rgb(255, 221, 0)",
			color9: "rgb(255, 221, 0)"
		},
		colorPicker: {},
		activeField: 0,
		partyMode: false,
		LEDType: "WS2801",
		LEDCount: 160,
		Touchmode: true,
		ShowCaptions: true,
		ShowPartyMode: false,
		NightTimeActive: true,
		NightTimeStart: 22,
		NightTimeEnd: 6,
		NightTimeNotifications: false,
		Notifications: [{}],
		PartyMatrix: [{}]
	},

	getStyles: function () {
		return [this.file("css/mmm-framelight.css"), "font-awesome.css"];
	},

	start: function () {
		// get json config from file
		this.sendSocketNotification("openJSON", {});
		// initialize this.config
		this.sendSocketNotification("CONFIG", this.config);
	},

	/**
	 * called after dom is created | hides module when touchmode is active and sets activeField
	 */
	loaded: function () {
		if (!this.config.Touchmode) {
			this.hide();
		}

		if (this.data.position === "top_left" || this.data.position === "bottom_left") {
			let controlsTopLeft = document.getElementsByClassName("controls");
			controlsTopLeft[0].className = "controls topLeft";
			controlsTopLeft[1].className = "controls topLeft";
		}

		// copy activePreset from json to activeField
		this.config.activeField = this.config.presets.activePreset;
	},

	/**
	 * Load script files
	 */
	getScripts: function () {
		return ["color_picker.js"];
	},

	/**
	 * Load translations files
	 */
	getTranslations: function () {
		return {
			en: "translations/en.json",
			de: "translations/de.json"
		};
	},

	/**
	 * cycle through config color array and substitute "active color"-string
	 * @param {array} colors contains an array of rgb strings, can contain "active color"
	 */
	getActiveColor: function (colors) {
		let retColor = colors.map((colorString) => {
			if (colorString.trim() != "active color") {
				return colorString;
			} else {
				return this.config.presets["color" + this.config.presets.activePreset];
			}
		});

		return retColor;
	},

	/**
	 * sends ledtype, ledcount, activecolor, partymode and given object to py
	 * @param {object} objectToPy object containing "effect"(string) and "colors"(array of string)
	 */
	sendObjectToPy: function (objectToPy) {
		let partyMode = false;

		let activeColor = this.config.presets["color" + this.config.activeField];

		function jsonReplaceActiveColor(object, returnString = false) {
			// replace "active color" string with actual active color
			let objectString = JSON.stringify(object);
			objectString = objectString.replace(/active color/g, activeColor);
			return returnString ? objectString : JSON.parse(objectString);
		}

		if (this.config.presets.state === "on" && this.config.partyMode && this.config.PartyMatrix.length)
			partyMode = true; // only set partyMode to true if LEDs are on

		if (this.config.presets.state === "off") activeColor = "rgb(0,0,0)"; // let py return to switched off LEDs instead of active color

		objectToPy = {
			// construct object for py
			...{ LEDType: this.config.LEDType, LEDCount: this.config.LEDCount },
			...objectToPy,
			...{ activeColor: activeColor },
			...{ partyMode: partyMode },
			...{ PartyMatrix: this.config.PartyMatrix }
		};

		objectToPy = jsonReplaceActiveColor(objectToPy);

		this.sendSocketNotification("sendToPy", objectToPy);
		this.sendSocketNotification("saveJSON", JSON.stringify(this.config.presets, null, 2));
	},

	/**
	 * Override dom generator | ಥ_ಥ html part ugly
	 */
	getDom: function () {
		let wrapper = document.createElement("div");
		wrapper.className = this.config.ledContainer;
		let self = this;

		//Light Button
		let lightbulb = document.createElement("div");
		lightbulb.className = "controls";
		if (this.config.ShowCaptions)
			lightbulb.innerHTML =
				'<a class="fas fa-lightbulb" id="lightBulb"><span id="switchCaption" class="btnCaption"></span></a>';
		else lightbulb.innerHTML = '<a class="fas fa-lightbulb" id="lightBulb"></a>';
		wrapper.appendChild(lightbulb);
		lightbulb.addEventListener("click", () => self.switchLights(this.config.presets));

		//Setting Button
		let settingDiv = document.createElement("div");
		settingDiv.className = "controls";
		if (this.config.ShowCaptions)
			settingDiv.innerHTML =
				'<a class="fas fa-sliders-h"><span class="btnCaption">' + this.translate("SETTINGS") + "</span></a>";
		else settingDiv.innerHTML = '<a class="fas fa-sliders-h"></a>';
		wrapper.appendChild(settingDiv);
		settingDiv.addEventListener("click", () => openSettings(this.config.presets, this));

		//Settings Menu
		let settingMenu = document.createElement("div");
		settingMenu.className = "settingsMenu hidden";
		settingMenu.id = "sMenu";

		// --> ColorWheel
		settingMenu.innerHTML = `
		<div id="colorWheel"></div>
		<div class="half">
			<div id="activeColor">
				<p>R</p>
				<span type="text" id="rColor">0</span>
				<p>G</p>
				<span type="text" id="gColor">0</span>
				<p>B</p>
				<span type="text" id="bColor">0</span>
			</div>
			<ul id="colorList">
			</ul>
			<div id="party">
				<p>PartyMode</p>
				<div class="onoffswitch">
					<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="switch" tabindex="0">
					<label class="onoffswitch-label" for="switch">
						<span class="onoffswitch-inner"></span>
						<span class="onoffswitch-switch"></span>
					</label>
				</div>
			</div>
		</div>`;
		document.body.appendChild(settingMenu);

		setTimeout(() => {
			// wait for dom and add event listener
			if (self.config.ShowPartyMode === false) {
				// hide PartyMode if set to "false"
				document.getElementById("party").style.display = "none";
				return;
			}

			//partyMode event handler
			let partyModeCheckBox = document.getElementById("switch");
			partyModeCheckBox.addEventListener("click", () => self.switchPartyMode());
		}, 300);

		// function to fill a number with zeros
		function padZeros(n, width, z) {
			z = z || "0";
			n = n + "";
			return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
		}

		/**
		 * get RGB values from RGB string | returns rgb array
		 * @param {string} rgb
		 */
		function getRGB(rgb) {
			rgb = rgb.replace(/[^\d,]/g, "").split(",");
			return rgb;
		}

		/**
		 * split RGB values onto the text fields
		 * @param {string} rgb
		 */
		function splitRGB(rgb) {
			rgb = getRGB(rgb);

			document.getElementById("rColor").textContent = padZeros(rgb[0], 3);
			document.getElementById("gColor").textContent = padZeros(rgb[1], 3);
			document.getElementById("bColor").textContent = padZeros(rgb[2], 3);
		}

		/**
		 * opens settings menu and sets color list
		 * @param {object} jsonPresets color object from preset json
		 * @param {object} self equals global this to be able to call global functions
		 */
		function openSettings(jsonPresets, self) {
			let colorWheel = document.getElementById("colorWheel").children[0];
			if (!colorWheel) {
				// create color wheel and pass current color
				startColorScript(jsonPresets["color" + jsonPresets.activePreset]);
			}

			let sMenu = document.getElementById("sMenu");
			if (sMenu.classList.contains("hidden")) {
				// show when hidden and change colorlist presets
				if (jsonPresets.state === "off")
					// activate lightbulb when settings menu opens
					self.switchLights(jsonPresets);

				sMenu.className = "settingsMenu";

				for (let i = 0; i <= 9; i++) {
					document.getElementById("colorField" + i).style.backgroundColor = jsonPresets["color" + i];
				}

				self.setColor(jsonPresets.activePreset); // set active color for color wheel
			} else {
				sMenu.className = "settingsMenu hidden";
			}
		}

		/**
		 * initiates color wheel
		 * @param {string} activeColor param like "rgb(x, y, z)"
		 */
		function startColorScript(activeColor) {
			colorPicker = new iro.ColorPicker("#colorWheel", {
				width: 240,
				height: 240,
				handleRadius: 20,
				handleOrigin: {
					y: 0,
					x: 0
				},
				color: activeColor,
				borderWidth: 2,
				borderColor: "#ffffff",
				padding: 2,
				wheelLightness: false,
				wheelAngle: 0,
				wheelDirection: "anticlockwise",
				layoutDirection: "vertical",
				transparency: true,
				layout: [
					{
						component: iro.ui.Wheel,
						options: {
							//borderColor: '#8d8d8d'
						}
					},
					{
						component: iro.ui.Slider,
						options: {
							//borderColor: '#8d8d8d'
						},
						sliderType: "value"
					},
					{
						component: iro.ui.Box,
						options: {}
					}
				]
			});

			const colorList = document.getElementById("colorList");
			for (let i = 0; i <= 9; i++) {
				let li = document.createElement("li");
				li.setAttribute("id", "colorField" + i);
				li.addEventListener("click", () => self.setColor(i));
				colorList.appendChild(li);
			}

			colorPicker.on(["mount", "color:change"], function () {
				colorPicker.colors.forEach((color) => {
					const activeField = self.config.activeField;
					const rgbString = color.rgbString;

					self.config.presets["color" + activeField] = rgbString;

					self.sendObjectToPy({
						effect: "setColor",
						colors: [color.rgbString]
					});

					colorField = document.getElementById("colorField" + activeField);
					colorField.style.background = rgbString;
					splitRGB(rgbString);
				});
			});
		}

		return wrapper;
	},

	/**
	 * sets active color for color wheel and list
	 * @param {int} colorIndex
	 */
	setColor: function (colorIndex) {
		const self = this;

		self.config.activeField = colorIndex;
		self.config.presets.activePreset = colorIndex;

		// get RGB values from RGB string
		function getRGB(rgb) {
			rgb = rgb.replace(/[^\d,]/g, "").split(",");
			return rgb;
		}

		if (document.getElementById("colorField" + colorIndex) != null) {
			// set RGB-Text to active
			bgColor = getRGB(document.getElementById("colorField" + colorIndex).style.backgroundColor);
			colorPicker.color.red = bgColor[0];
			colorPicker.color.green = bgColor[1];
			colorPicker.color.blue = bgColor[2];

			// change every colorField item back to standart size
			for (let i = 0; i <= 9; i++) {
				document.getElementById("colorField" + i).style.transform = "scale(1)";
			}
			// only change size of active item
			document.getElementById("colorField" + colorIndex).style.transform = "scale(1.2)";

			self.sendObjectToPy({
				effect: "setColor",
				colors: [colorPicker.color.rgbString]
			});

			self.switchLights(self.config.presets, true);
		}
	},

	/**
	 * changes lightbulb icon and sends light signal to py depending on state
	 * @param {object} jsonPresets color object from preset json
	 * @param {object} turnOn color object from preset json
	 */
	switchLights: function (jsonPresets, turnOn = undefined) {
		const self = this;
		let lightIcon = document.getElementById("lightBulb");
		let switchCaption = document.getElementById("switchCaption");

		if ((lightIcon.classList.contains("fas") && turnOn === undefined) || turnOn === false) {
			lightIcon.className = "far fa-lightbulb"; // far = off
			if (switchCaption != null) {
				switchCaption.innerHTML = self.translate("TURNON");
			}
			self.config.presets.state = "off";
			jsonPresets.state = "off";
			self.sendObjectToPy({ effect: "lightOff", colors: ["rgb(0,0,0)"] });
		} else if ((lightIcon.classList.contains("far") && turnOn === undefined) || turnOn === true) {
			lightIcon.className = "fas fa-lightbulb"; // fas = on
			if (switchCaption != null) {
				switchCaption.innerHTML = self.translate("TURNOFF");
			}
			self.config.presets.state = "on";
			jsonPresets.state = "on";
			self.sendObjectToPy({
				effect: "lightOn",
				colors: [self.config.presets["color" + self.config.presets.activePreset]]
			});
		}
	},

	/**
	 * switch config.partyMode and send to py
	 * @param {boolean} turnOn needs a fixed state when called withing API block
	 */
	switchPartyMode: function (turnOn) {
		const self = this;

		if (turnOn === undefined) {
			self.config.partyMode = !self.config.partyMode;
			turnOn = true;
		} else {
			self.config.partyMode = turnOn;
		}

		self.switchLights(self.config.presets, turnOn);

		partyModeCheckBox = document.getElementById("switch");
		if (partyModeCheckBox) {
			partyModeCheckBox.checked = self.config.partyMode;
		}
	},

	/**
	 * communicates with node_helper.js
	 * @param {string} notification
	 * @param {string} payload json string
	 */
	socketNotificationReceived: function (notification, payload) {
		const self = this;

		function setCaptionWidth(captionObject) {
			// switch caption to compare the width of the captions
			let width = 0;
			const bufferHTML = captionObject.innerHTML;

			captionObject.innerHTML = self.translate("TURNON");
			width = captionObject.clientWidth;
			captionObject.innerHTML = self.translate("TURNOFF");
			width = width > captionObject.clientWidth ? width : captionObject.clientWidth;

			captionObject.innerHTML = bufferHTML;
			captionObject.style.width = width + 1 + "px";
		}

		if (notification === "ledPresets") {
			try {
				this.config.presets = JSON.parse(payload);

				const lightIcon = document.getElementById("lightBulb");
				const switchCaption = document.getElementById("switchCaption");

				if (this.config.presets.state === "on") {
					lightIcon.className = "fas fa-lightbulb";
					switchCaption.innerHTML = self.translate("TURNOFF");
					self.sendObjectToPy({
						effect: "lightOn",
						colors: [self.config.presets["color" + self.config.presets.activePreset]]
					});
				} else {
					lightIcon.className = "far fa-lightbulb";
					switchCaption.innerHTML = self.translate("TURNON");
					self.sendObjectToPy({
						effect: "lightOff",
						colors: ["rgb(0,0,0)"]
					});
				}
				setCaptionWidth(switchCaption);
			} catch (e) {
				console.log("error: " + e);
				this.sendSocketNotification("createJSON", {});
			}
		}
		this.loaded();
	},

	/**
	 * checking configured notifications | when notification is recognized effect object will be created and sent to py
	 * @param {string} notification
	 * @param {string} payload
	 * @param {string} sender
	 */
	notificationReceived: function (notification, payload, sender) {
		const self = this;
		let d = new Date();
		let actualHours = d.getHours();
		let actualMinutes = d.getMinutes();
		let actualSeconds = d.getSeconds();
		
		/**
		 * check if actual hours is between nighttime start and nighttime end
		 * @param {integer} NTStart 
		 * @param {integer} NTEnd 
		 * @param {integer} AH 
		 */
		function checkNightTime(NTStart, NTEnd, AH) {
			if (AH === NTStart) return true; // first hour returns true
			if (AH === NTEnd) return false;	// last hour returns false
		
			let isInRange = false;
			const isBiggerThanBoth = () => AH > NTStart && AH > NTEnd;
			const isSmallerThanBoth = () => AH < NTStart && AH < NTEnd;
		
			if(isBiggerThanBoth() || isSmallerThanBoth()) isInRange = true;
			if (NTStart < NTEnd) isInRange = !isInRange; // invert result when NTStart < NTEnd
		
			return isInRange;
		}

		// for each configured notification send specified effect to py
		self.config.Notifications.forEach((nFication) => {
			if (nFication.name === notification) {
				// check if NightTimeNotifications in config is set to true
				if (self.config.NightTimeNotifications) {
					self.sendObjectToPy(nFication);
				} else {
					// if NightTimeNotifications in config is set to false, check if actualHours is out of night time
					if (!checkNightTime(self.config.NightTimeStart, self.config.NightTimeEnd, actualHours)) {
						self.sendObjectToPy(nFication);
					}
				}
			}
		});

		// when night time starts, switch leds off once (exactly at the beginning of night time)
		if (actualHours === self.config.NightTimeStart && actualMinutes === 0 && actualSeconds === 0) {
			self.switchLights(self.config.presets, false);
		}

		switch (notification) {
			case "FRAMELIGHT_ON":
				self.switchLights(self.config.presets, true);
				break;
			case "FRAMELIGHT_OFF":
				self.switchLights(self.config.presets, false);
				break;
			case "FRAMELIGHT_PARTY_ON":
				self.switchPartyMode(true);
				break;
			case "FRAMELIGHT_PARTY_OFF":
				self.switchPartyMode(false);
				break;
			case "FRAMELIGHT_PRESET":
				colorIndex = payload["preset"] || 0;
				self.setColor(colorIndex);
				break;
		}
	}
});
