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
		ShowPartyMode: true,
		NightTimeActive: true,
		NightTimeStart: 22,
		NightTimeEnd: 6,
		NightTimeNotifications: true,
		Notifications: [{}],
		PartyMatrix: [{}]
	},

	getStyles: function () {
		return [this.file('css/mmm-framelight.css'), 'font-awesome.css'];
	},

	start: function () {
		// get json config from file
		this.sendSocketNotification("openJSON", {});
		// initialize this.config
		this.sendSocketNotification('CONFIG', this.config);
	},

	/**
	 * called after dom is created | hides module when touchmode is active and sets activeField
	 */
	loaded: function () {
		if (!this.config.Touchmode) {
			this.hide();
		}

		// copy activePreset from json to activeField
		this.config.activeField = this.config.presets.activePreset;
	},

	/**
	 * Load script files
	 */
	getScripts: function () {
		return [
			"color_picker.js"
		]
	},

	/**
	 * Load translations files
	 */
	getTranslations: function () {
		//FIXME: This can be load a one file javascript definition
		return {
			en: "translations/en.json",
			de: "translations/de.json"
		};
	},

	/**
	 * cycle through config color array and substitute "active color"-string
	 * @param {array} colors contains an array of rgb strings, can contain "active color"
	 */
	getActiveColor: function(colors) {
		let retColor = colors.map(colorString => {
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
	sendObjectToPy: function(objectToPy) {
		let d = new Date();
		let actualHours = d.getHours();
		let partyMode = false;

		let activeColor = this.config.presets["color" + this.config.activeField];
		
		function jsonReplaceActiveColor(object, returnString=false) {
			// replace "active color" string with actual active color
			let objectString = JSON.stringify(object);
			objectString = objectString.replace(/active color/g, activeColor);
			return returnString ? objectString: JSON.parse(objectString);
		}

		if (this.config.presets.state === "on" && this.config.partyMode && this.config.PartyMatrix.length)
			partyMode = true; // only set partyMode to true if LEDs are on

		if (this.config.presets.state === "off") activeColor = "rgb(0,0,0)"; // let py return to switched off LEDs instead of active color

		objectToPy = { // construct object for py
			...{"LEDType": this.config.LEDType, "LEDCount": this.config.LEDCount}, 
			...objectToPy,
			...{"activeColor": activeColor},
			...{"partyMode": partyMode},
			...{"PartyMatrix": this.config.PartyMatrix}
		};

		objectToPy = jsonReplaceActiveColor(objectToPy);

		if (this.config.NightTimeNotifications) {
			this.sendSocketNotification("sendToPy", objectToPy);
			this.sendSocketNotification("saveJSON", JSON.stringify(this.config.presets, null, 2));
		} else {
			if ((actualHours >= this.config.NightTimeEnd) && (actualHours <= this.config.NightTimeStart)) {
				this.sendSocketNotification("sendToPy", objectToPy);
				this.sendSocketNotification("saveJSON", JSON.stringify(this.config.presets, null, 2));
			}
		}
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
		lightbulb.className = 'controls';
		if (this.config.ShowCaptions) 
			lightbulb.innerHTML = '<a class="fas fa-lightbulb" id="lightBulb"><span id="switchCaption" class="btnCaption"></span></a>';
		else
			lightbulb.innerHTML = '<a class="fas fa-lightbulb" id="lightBulb"></a>';
		wrapper.appendChild(lightbulb);
		lightbulb.addEventListener("click", () => switchLights(this.config.presets));

		//Setting Button
		let settingDiv = document.createElement("div");
		settingDiv.className = 'controls';
		if (this.config.ShowCaptions) 
			settingDiv.innerHTML = '<a class="fas fa-sliders-h"><span class="btnCaption">' + this.translate("SETTINGS") + '</span></a>';
		else
			settingDiv.innerHTML = '<a class="fas fa-sliders-h"></a>';
		wrapper.appendChild(settingDiv);
		settingDiv.addEventListener("click", () => openSettings(this.config.presets));

		//Settings Menu
		let settingMenu = document.createElement("div");
		settingMenu.className = 'settingsMenu hidden';
		settingMenu.id = 'sMenu';

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
		wrapper.appendChild(settingMenu);


		setTimeout(() => { // wait for dom and add event listener
			if (self.config.ShowPartyMode === false) { // hide PartyMode if set to "false"
				document.getElementById('party').style.display = 'none';
				return;
			}
		
			//partyMode event handler
			let partyModeCheckBox = document.getElementById("switch");
			partyModeCheckBox.addEventListener("click", () => switchPartyMode());
		}, 300);

		// function to fill a number with zeros
		function padZeros(n, width, z) {
			z = z || '0';
			n = n + '';
			return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
		}

		/**
		 * switch config.partyMode and send to py
		 */
		function switchPartyMode() {
			self.config.partyMode = !self.config.partyMode;
			switchLights(self.config.presets, 1);
			self.sendObjectToPy({effect: "lightOn", colors:[self.config.presets["color" + self.config.presets.activePreset]]});
		}

		/**
		 * get RGB values from RGB string | returns rgb array
		 * @param {string} rgb 
		 */
		function getRGB(rgb) {
			rgb = rgb.replace(/[^\d,]/g, '').split(',');
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
		 */
		function openSettings(jsonPresets) {
			let colorWheel = document.getElementById("colorWheel").children[0];
			if (!colorWheel) { // create color wheel and pass current color
				startColorScript(jsonPresets["color" + self.config.presets.activePreset]);
			}

			let sMenu = document.getElementById("sMenu");
			if (sMenu.classList.contains("hidden")) { // show when hidden and change colorlist presets
				if (self.config.presets.state === "off") // activate lightbulb when settings menu opens
					switchLights(self.config.presets);

				sMenu.className = "settingsMenu";

				for (let i = 0; i <= 9; i++) {
					document.getElementById("colorField" + i).style.backgroundColor = jsonPresets["color" + i];
				}

				setColor(self.config.presets.activePreset); // set active color for color wheel
			} else {
				sMenu.className = "settingsMenu hidden"; 
			}
		}

		/**
		 * changes lightbulb icon and sends light signal to py depending on state
		 * @param {object} jsonPresets color object from preset json 
		 */
		function switchLights(jsonPresets, state = 2) { 
			let lightIcon = document.getElementById("lightBulb");
			let switchCaption = document.getElementById("switchCaption");

			if (lightIcon.classList.contains("far") && state != 0) {
				state = 1;
				lightIcon.className = "fas fa-lightbulb";
				if(switchCaption != null) switchCaption.innerHTML = self.translate("TURNOFF");
				self.config.presets.state = "on";
				jsonPresets.state = "on";
				self.sendObjectToPy({effect: "lightOn", colors:[self.config.presets["color" + self.config.presets.activePreset]]});
			}
			if (lightIcon.classList.contains("fas") && state != 1) {
				lightIcon.className = "far fa-lightbulb";
				if(switchCaption != null) switchCaption.innerHTML = self.translate("TURNON");
				self.config.presets.state = "off";
				jsonPresets.state = "off";
				self.sendObjectToPy({effect: "lightOff", colors:["rgb(0,0,0)"]});
			}
		}

		/**
		 * sets active color for color wheel and list
		 * @param {int} colorIndex 
		 */
		function setColor(colorIndex) {
			self.config.activeField = colorIndex;
			self.config.presets.activePreset = colorIndex;
	
			// get RGB values from RGB string
			function getRGB(rgb) {
				rgb = rgb.replace(/[^\d,]/g, '').split(',');
				return rgb;
			}
	
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
	
			self.sendObjectToPy({effect: "setColor", colors:[colorPicker.color.rgbString]});
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
				wheelDirection: 'anticlockwise',
				layoutDirection: 'vertical',
				transparency: true,
				layout: [{
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
						sliderType: 'value'
					},
					{ 
						component: iro.ui.Box,
						options: {}
					},
				]
			});

			const colorList = document.getElementById("colorList");
			for (let i = 0; i <= 9; i++) {
				let li = document.createElement("li");
				li.setAttribute("id", "colorField" + i);
				li.addEventListener( 'click', () => setColor(i), false);
				colorList.appendChild(li);
			}

			colorPicker.on(["mount", "color:change"], function () {
				colorPicker.colors.forEach(color => {
					const activeField = self.config.activeField;
					const rgbString = color.rgbString;

					self.config.presets["color" + activeField] = rgbString;

					self.sendObjectToPy({effect: "setColor", colors:[color.rgbString]});

					colorField = document.getElementById("colorField" + activeField);
					colorField.style.background = rgbString;
					splitRGB(rgbString);
				});
			});
		}

		return wrapper;
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
					self.sendObjectToPy({effect: "lightOn", colors:[self.config.presets["color" + self.config.presets.activePreset]]});
				} else {
					lightIcon.className = "far fa-lightbulb";
					switchCaption.innerHTML = self.translate("TURNON");
					self.sendObjectToPy({effect: "lightOff", colors:["rgb(0,0,0)"]});
				}
				setCaptionWidth(switchCaption);
			} catch (e) {
				console.log("error: "+e);
				this.sendSocketNotification("createJSON", {});
			};
		}
		this.loaded();
	},

	/**
	 * checking configured notifications | when notification is recognized effect object will be created and sent to py
	 * @param {string} notification 
	 * @param {string} payload 
	 * @param {string} sender 
	 */
	notificationReceived: function(notification, payload, sender) {
		const self = this;
		
		// for each configured notification send specified effect to py
		self.config.Notifications.forEach((nFication) => {
			if (nFication.name === notification) {
				self.sendObjectToPy(nFication);
			}
		});

		let lightIcon = document.getElementById("lightBulb");
		let switchCaption = document.getElementById("switchCaption");
		if(notification === 'FRAMELIGHT_ON') {
			lightIcon.className = "fas fa-lightbulb";
			if(switchCaption != null) switchCaption.innerHTML = self.translate("TURNOFF");
			self.config.presets.state = "on";
			self.sendObjectToPy({effect: "lightOn", colors:[self.config.presets["color" + self.config.presets.activePreset]]});
		}
		if(notification === 'FRAMELIGHT_OFF') {
			lightIcon.className = "far fa-lightbulb";
			if(switchCaption != null) switchCaption.innerHTML = self.translate("TURNON");
			self.config.presets.state = "off";
			self.sendObjectToPy({effect: "lightOff", colors:["rgb(0,0,0)"]});
		}
		if(notification === 'FRAMELIGHT_PARTY_ON') {
			self.config.partyMode = true;

			lightIcon.className = "fas fa-lightbulb";
			if(switchCaption != null) switchCaption.innerHTML = self.translate("TURNOFF");
			self.config.presets.state = "on";
			self.sendObjectToPy({effect: "lightOn", colors:[self.config.presets["color" + self.config.presets.activePreset]]});

			self.sendObjectToPy({effect: "lightOn", colors:[self.config.presets["color" + self.config.presets.activePreset]]});
		}
		if(notification === 'FRAMELIGHT_PARTY_OFF') {
			self.config.partyMode = false;
			switchLights(self.config.presets, 1);
			self.sendObjectToPy({effect: "lightOn", colors:[self.config.presets["color" + self.config.presets.activePreset]]});
		}
		if(notification === 'FRAMELIGHT_PRESET') {
			colorIndex = payload[0]['colorIndex'];
			self.config.activeField = colorIndex;
			self.config.presets.activePreset = colorIndex;
	
			self.sendObjectToPy({effect: "setColor", colors:[self.config.presets["color" + self.config.presets.activePreset]]});
		}

	}

});
