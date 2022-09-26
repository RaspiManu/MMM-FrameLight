<p align="center" width="100%">
    <img src="../media/README Media/images/FrameLight_Logo.png" width="600">
    <br><br>
    <img src="https://img.shields.io/github/license/RaspiManu/MMM-FrameLight">
    <img src="https://img.shields.io/github/downloads/RaspiManu/MMM-FrameLight/total">
    <img src="https://img.shields.io/github/contributors/RaspiManu/MMM-FrameLight">
    <img src="https://img.shields.io/github/issues-pr-closed/RaspiManu/MMM-FrameLight">
    <img src="https://img.shields.io/maintenance/yes/2022">
    <br><br>
    <a href="#demonstration">Demonstration</a> |
    <a href="#installation-and-updating">Installation and Updating</a> |
    <a href="#configuration">Configuration</a> |
    <a href="#contribution">Contribution</a> |
    <a href="#special-thanks">Special Thanks</a> |
    <a href="#license">License</a>
    <br><br>
</p>
	
# MMM-FrameLight

This is a [MagicMirror²](https://magicmirror.builders/) module for controlling an RGB-LED strip mounted onto or embedded into a smart mirror's frame. It can be used with the following input methods:
- touch control (via IR touch frame or similar)
- MagicMirror² system notifications (example use cases: voice control, home automation)

<img src="../media/README Media/images/break.png" width="1000" height="40">

## Demonstration

WORK IN PROGRESS

<img src="../media/README Media/images/break.png" width="1000" height="40">

## Installation and Updating

This chapter shows how to install MMM-FrameLight and maintain it.

<img src="../media/README Media/images/break.png" width="1000" height="16">

### Installing the hardware

To use MMM-FrameLight, it is essential to have a **WS2801 LED strip** connected to the smart mirror device. Other types of LED strips are currently not supported. WS2801 is the default LED type of the module because some other types may block the onboard sound output of a Raspberry Pi (see [here](https://github.com/adafruit/Adafruit_CircuitPython_WS2801)). This could lead to problems when using voice control or other sound related MagicMirror² modules. The LED strip should be **mounted clockwise** around the mirror.

There are a lot of good tutorials on how to connect the WS2801 LED strip to a device. Here are some Links for the most common case (RaspberryPi):
- [How to control a Raspberry Pi WS2801 RGB LED Strip](https://tutorials-raspberrypi.com/how-to-control-a-raspberry-pi-ws2801-rgb-led-strip/)
- [Raspberry Pi controlled WS2801 RGB LEDs](https://andypi.co.uk/2014/12/27/raspberry-pi-controlled-ws2801-rgb-leds/)

**NOTE:** The Links are listed to provide information about wiring the LED strip. The installation of the described software is not needed to use MMM-FrameLight.

<img src="../media/README Media/images/warning_break.png" width="1000" height="8">

**WARNING:** Be careful when working with electricity and double check the wires of the LED strip because the colors may be unintuitive. We - the module developers - are not responsible for any damage to you or your project.

<img src="../media/README Media/images/warning_break.png" width="1000" height="8">

<img src="../media/README Media/images/break.png" width="1000" height="16">

### Installing the module

The first software related step is to install some repositories used by MMM-FrameLight by following the links below and completing their installation steps.

- [Adafruit CircuitPython WS2801](https://github.com/adafruit/Adafruit_CircuitPython_WS2801)
- [Python Shell](https://github.com/extrabacon/python-shell)

After successfully installing the needed repositories, MMM-FrameLight can be installed by using these commands in a console / terminal (LXTerminal on Raspberry Pi):

```bash
cd ~/MagicMirror/modules                                  #adapt path to module folder if it is not the default folder
git clone https://github.com/RaspiManu/MMM-FrameLight
cd MMM-FrameLight
npm install
```

<img src="../media/README Media/images/break.png" width="1000" height="16">

### Updating the module

MMM-FrameLight can be updated / maintained by using `git` commands inside the module's folder. To update use the following commands:

```bash
cd ~/MagicMirror/modules/MMM-FrameLight                   #adapt path to module folder if it is not the default folder
git status                                                #optional step to check for changes before updating
git pull
```

If `git pull` leads to a message like “your local changes to the following files would be overwritten by merge”, you may have done local edits to the module's files. The local module files can be reset by using `git reset --hard` before using `git pull`. A backup of the old files is recommended in case some changes were on purpose (e.g. modifications to the module's look by editing the CSS file) and need to be restored after updating.

<img src="../media/README Media/images/break.png" width="1000" height="40">

## Configuration

This chapter is about the configuration of MMM-FrameLight to fit individual needs. It can be used with its basic functionality (touch controlled background light only), with advanced functionality (additional lighting effects on system notifications and party mode) or as a hidden module controlled by other modules (non-touch). Controlling the module via other modules can also be combined with touch input.

<img src="../media/README Media/images/break.png" width="1000" height="16">

### Basic touch configuration

The basic configuration of the module is focused on its core functionality as a touch controlled background light around the smart mirror. It can be configured this way by opening `config/config.js` inside the MagicMirror folder an adding the following to the `modules: {}` section:

```js
{
	module: 'MMM-FrameLight',
	position: 'bottom_right',
	header: 'FrameLight',
	config: {
		LEDType: "WS2801",
		LEDCount: 160,
		Touchmode: true,
		ShowCaptions: true,
		ShowPartyMode: false,
		NightTimeActive: true,
		NightTimeStart: 22,
		NightTimeEnd: 6,
		NightTimeNotifications: false,
		Notifications: [],
		PartyMatrix: []
	}
},
```

The module's `position` can be defined according to the [MagicMirror² documentation on module configuration](https://docs.magicmirror.builders/modules/configuration.html). For aesthetic reasons, the options `'top_left'`, `'top_center'`, `'top_right'`, `'bottom_left'`, `'bottom_center'` and `'bottom_right'` are highly recommended. Using a `header` above the touch buttons is optional. It can be filled with any text (string, e.g. something in native language). The settings within `config: {}` work as described in the following table:

| Parameter | Type     | Description                |Default                    |Options                    |
| :-------- | :------- | :------------------------- |:------------------------- |:------------------------- |
| LEDType | string | LED type of the strip used | "WS2801" | "WS2801" is only option at the moment<br>(see "Installing the hardware")|
| LEDCount | integer | **customization required**<br>number of LEDs of the strip used | 160 | any integer matching your LED strip |
| Touchmode | boolean | show module's graphical touch interface<br>false will lead to module working hidden in background<br>(requires "Non-touch configuration", see below) | true | true / false |
| ShowCaptions | boolean | show touch buttons' captions | true | true / false |
| ShowPartyMode | boolean | show party mode switch within settings menu<br>(party mode requires "Advanced configuration", see below) | false | true / false |
| NightTimeActive | boolean | turn off lights when defined night time starts<br>(no automatic restoring of state before night time after night time for safety reasons) | true | true / false |
| NightTimeStart | integer | time at which night time mode is activated | 22 | integers from 0 to 23 |
| NightTimeEnd | integer | time at which night time mode is deactivated | 6 | integers from 0 to 23 |
| NightTimeNotifications | boolean | show notification effects during night time<br>(notification effects require "Advanced configuration", see below) | false | true / false |
| Notifications | array | array with custom effects on system notifications | [ ] | see "Advanced configuration" |
| PartyMatrix | array | array with a repeating sequence of custom effects | [ ] | see "Advanced configuration" |

<img src="../media/README Media/images/break.png" width="1000" height="16">

### Advanced touch configuration
The advanced configuration of the module adds lighting effects to the basic configuration, which must be set up in advance. Those effects can be used as a reaction on system notifications and as party lighting. This subchapter describes how to define specific effects on system notifications and the effect loop for the party mode. It also provides a list of all effects and their configuration options.

<img src="../media/README Media/images/warning_break.png" width="1000" height="8">

**WARNING:** The following subchapter contains bright, flashing imagery that may cause discomfort and / or seizures for those with photosensitive epilepsy. Reader discretion is advised.

<img src="../media/README Media/images/warning_break.png" width="1000" height="8">

<img src="../media/README Media/images/break.png" width="1000" height="8">

#### Effects on system notifications

There are a lot of options on what to realize with lighting effects on system notifications. Example use cases are visual feedback on touch gestures or indicating that another module shows new information. Effects on notifications are defined within `Notifications: []` under `config: {}` analogous to this example:

```js
Notifications: [{
	name: "ARTICLE_NEXT",
	effect: "BlinkColor",
	colors: ["rgb(0,255,0)"],
	options: [2, 0.5]
},
{
	name: "ARTICLE_PREVIOUS",
	effect: "BlinkColor",
	colors: ["rgb(255,0,0)"],
	options: [2, 0.5]
}],
```
Every definition inside `Notifications: []` is surrounded by `{}`, separated by `,` and contains the `name` of the notification and the configuration of the effect to use as a reaction on it. For explanations on how to configure effects see "Effect configuration".

<img src="../media/README Media/images/break.png" width="1000" height="8">

#### Party mode

Setting up a repeating sequence of custom effects for party mode is a great way of showing the smart mirror's LED lights to friends and family. `ShowPartyMode: true` is essential to be able to activate the party mode via touch input. The party mode sequence is defined within `PartyMatrix: []` under `config: {}` analogous to this example:

```js
PartyMatrix: [{
	effect: "RainbowCycle",
	colors: [],
	options: [2, 0.005]
},
{
	effect: "DockingTrains",
	colors: ["rgb(255, 0, 0)", "rgb(0, 255, 0)"],
	options: [2, 0.01, 20]
}]
```

Every lighting effect inside `PartyMatrix: []` is surrounded by `{}` and separated by `,`. For explanations on how to configure effects see "Effect configuration".

<img src="../media/README Media/images/break.png" width="1000" height="8">

#### Effect configuration

The configuration of a lighting effect always consists of the three following lines of code:

```js
effect: "",		//call effect by its name
colors: [],		//define colors used by effect
options: []		//set configuration options besides colors
```

`colors` and `options` are arrays whose contents are separated by `,`.

MMM-FrameLight works with the RGB color format. Each color needs to be set like `"rgb(255, 0, 0)"` (string because of data transfer to Python). Dimmed colors or unlit segments of effects can be realized by increasing the amount of black in the color. The current background light color can be implemented into an effect via using `"active color"` instead of an RGB string as one of the colors. Doing so can lead to beautiful overlaying effects. The RGB values of the desired colors could be taken from the settings menu of the module (touch configuration only).

**NOTE:** Each effect has its own number of `colors` and `options` and all of them need to be set according to the effect list below (order of `colors` and `options` matters).

The following effects are currently available for selection:

1. **Blink Color**
   
   <img src="../media/README Media/GIFs/Blink_Color.gif" width="200">
   
   This lighting effect is a simple blinking of the whole LED strip overlaying the currently used background light color (if background light is turned on) and can be set by using:

   ```js
   effect: "BlinkColor",
   colors: [color1],
   //colors order: color1 (blinking color)
   options: [cycles, time_per_step]
   //options order: cycles, time_per_step
   ```

   | Parameter | Array     | Position                   | Description                | Options                    | Example                   |
   | :-------- | :------- | :------------------------- |:------------------------- |:------------------------- |:------------------------- |
   | color1 | colors | 1 | LED strip will blink in this color | any RGB color | "rgb(0,255,0)" |
   | cycles | options | 1 | how often the LED strip will blink | any integer | 2 |
   | time_per_step | options | 2 | time in seconds for one step of the effect | any duration | 0.5 |

   Special features: none

2. **Rainbow Cycle Successive**
   
   <img src="../media/README Media/GIFs/Rainbow_Cycle_Successive.gif" width="200">

   This lighting effect fills the LED strip with a rainbow overlaying a fixed color or the currently used background light color (`"active color"` as `color1`) and can be set by using:

   ```js
   effect: "RainbowCycleSuccessive",
   colors: [color1],
   //colors order: color1 (background color)
   options: [cycles, time_per_step]
   //options order: cycles, time_per_step
   ```

   | Parameter | Array     | Position                   | Description                | Options                    | Example                   |
   | :-------- | :------- | :------------------------- |:------------------------- |:------------------------- |:------------------------- |
   | color1 | colors | 1 | color in background of the rainbow | any RGB color | "rgb(255,255,255)" |
   | cycles | options | 1 | how often the rainbow will appear | any integer | 1 |
   | time_per_step | options | 2 | time in seconds for one step of the effect | any duration | 0.02 |

   Special features: none

3. **Rainbow Cycle**
   
   <img src="../media/README Media/GIFs/Rainbow_Cycle.gif" width="200">

   This lighting effect fills the LED strip with all rainbow colors spinning around at once and can be set by using:

   ```js
   effect: "RainbowCycle",
   colors: [],
   //colors order: none
   options: [cycles, time_per_step]
   //options order: cycles, time_per_step
   ```

   | Parameter | Array     | Position                   | Description                | Options                    | Example                   |
   | :-------- | :------- | :------------------------- |:------------------------- |:------------------------- |:------------------------- |
   | cycles | options | 1 | how often the rainbow will spin around | any integer | 2 |
   | time_per_step | options | 2 | time in seconds for one step of the effect | any duration | 0.005 |

   Special features: none

4. **Rainbow Colors**
   
   <img src="../media/README Media/GIFs/Rainbow_Colors.gif" width="200">

   This lighting effect shifts through all rainbow colors while the LED strip only shows one color at a time and can be set by using:

   ```js
   effect: "RainbowColors",
   colors: [],
   //colors order: none
   options: [cycles, time_per_step]
   //options order: cycles, time_per_step
   ```

   | Parameter | Array     | Position                   | Description                | Options                    | Example                   |
   | :-------- | :------- | :------------------------- |:------------------------- |:------------------------- |:------------------------- |
   | cycles | options | 1 | how many passes through all colors will be done | any integer | 2 |
   | time_per_step | options | 2 | time in seconds for one step of the effect | any duration | 0.05 |

   Special features: none

5. **Docking Trains**
   
   <img src="../media/README Media/GIFs/Docking_Trains.gif" width="200">

   This lighting effect spawns "trains" at the end of the LED strip moving to the start until the strip is filled and can be set by using:

   ```js
   effect: "DockingTrains",
   colors: [color1, color2],
   //colors order: color1 (background color), color2 (train color)
   options: [cycles, time_per_step, length]
   //options order: cycles, time_per_step, length
   ```

   | Parameter | Array     | Position                   | Description                | Options                    | Example                   |
   | :-------- | :------- | :------------------------- |:------------------------- |:------------------------- |:------------------------- |
   | color1 | colors | 1 | color in background of the "trains" | any RGB color | "rgb(255,0,0)" |
   | color2 | colors | 2 | color of the "trains" | any RGB color | "rgb(0,255,0)" |
   | cycles | options | 1 | how often the LED strip will be filled with "trains" | any integer | 4 |
   | time_per_step | options | 2 | time in seconds for one step of the effect | any duration | 0.01 |
   | length | options | 3 | how long the "trains" are (in single LEDs) | any integer | 10 |

   Special features: switches the defined colors every cycle

6. **K.I.T.T.**
   
   <img src="../media/README Media/GIFs/KITT.gif" width="200">

   This lighting effect imitates the LED bar of K.I.T.T. from Knight Rider and can be set by using:

   ```js
   effect: "KITT",
   colors: [color1, color2],
   //colors order: color1 (background color), color2 (segment color)
   options: [cycles, time_per_step, length]
   //options order: cycles, time_per_step, length
   ```

   | Parameter | Array     | Position                   | Description                | Options                    | Example                   |
   | :-------- | :------- | :------------------------- |:------------------------- |:------------------------- |:------------------------- |
   | color1 | colors | 1 | color in background of the moving segment | any RGB color | "rgb(0,0,0)" |
   | color2 | colors | 2 | color of the moving segment | any RGB color | "rgb(255,0,0)" |
   | cycles | options | 1 | how often the segment will move back and forth | any integer | 2 |
   | time_per_step | options | 2 | time in seconds for one step of the effect | any duration | 0.005 |
   | length | options | 3 | how long the moving segment is (in single LEDs) | any integer | 10 |

   Special features: none

7. **Wobbling Segments**
   
   <img src="../media/README Media/GIFs/Wobbling_Segments.gif" width="200">

   This lighting effect splits the LED strip into the given number of segments with two different colors and lets them wobble. It can be set by using:

   ```js
   effect: "WobblingSegments",
   colors: [color1, color2],
   //colors order: color1, color2
   options: [cycles, time_per_step, segments, wobble_factor]
   //options order: cycles, time_per_step, segments, wobble_factor
   ```

   | Parameter | Array     | Position                   | Description                | Options                    | Example                   |
   | :-------- | :------- | :------------------------- |:------------------------- |:------------------------- |:------------------------- |
   | color1 | colors | 1 | first color for wobbling segments | any RGB color | "rgb(0,0,255)" |
   | color2 | colors | 2 | second color for wobbling segments | any RGB color | "rgb(255,0,0)" |
   | cycles | options | 1 | how often the segments will wobble | any integer | 2 |
   | time_per_step | options | 2 | time in seconds for one step of the effect | any duration | 0.1 |
   | segments | options | 3 | how many segments the LED strip will be split into | any integer | 10 |
   | wobble_factor | options | 4 | how far the segments wobble in relation to their own length  | 0 ... 1 | 0.5 |

   Special features: has a safety function that deflects to the next best number of segments if the given number is not feasible

8. **Swipe Move**
   
   <img src="../media/README Media/GIFs/Swipe_Move.gif" width="200">

   This lighting effect shows a mono- or bidirectional swipe move and is highly configurable to visualize touch inputs and system notifications. It can be set by using:

   ```js
   effect: "SwipeMove",
   colors: [color1, color2],
   //colors order: color1 (background color), color2 (swipe move color)
   options: [cycles, time_per_step, movement_start, movement_direction, movement_width, bar_length, offset_start]
   //options order: cycles, time_per_step, movement_start, movement_direction, movement_width, bar_length, offset_start
   ```

   | Parameter | Array     | Position                   | Description                | Options                    | Example                   |
   | :-------- | :------- | :------------------------- |:------------------------- |:------------------------- |:------------------------- |
   | color1 | colors | 1 | color in background of the swipe move | any RGB color | "rgb(0,0,0)" |
   | color2 | colors | 2 | color of the swipe move | any RGB color | "rgb(0,255,0)" |
   | cycles | options | 1 | how often the swipe move will appear | any integer | 1 |
   | time_per_step | options | 2 | time in seconds for one step of the effect | any duration | 0.02 |
   | movement_start | options | 3 | position number of the start LED for the effect | any position number of an LED on strip used | 20 |
   | movement_direction | options | 4 | direction of movement  | "right", "left", "both" | "right" |
   | movement_width | options | 5 | how long the movement is (in single LEDs)  | any distance | 40 |
   | bar_length | options | 6 | how long the swipe move bar can be (in single LEDs) | any number of LEDs | 10 |
   | offset_start | options | 7 | how many single LEDs away from movement_start the effect will start | any number of LEDs | 0 |

   Special features: none

   **NOTE:** To seamlessly implement the visualisation of a touch input, using `"active color"` as `color1` is highly recommended. When using direction "both" with an even number of LEDs, movement_start has to be the right one of the two start LEDs. The option offset_start is mainly focused on bidirectional configurations and should normally be 0. An example for using offset_start is to configure a swipe move at the top and bottom of the frame (see GIF, middle height of one side is movement_start).

<img src="../media/README Media/images/break.png" width="1000" height="16">

### Non-touch configuration

The non-touch configuration of the module is focused on hiding it on mirrors without touch input and controlling it via MagicMirror² system notifications. This is realized by setting up the basic touch configuration with `Touchmode: false`. The control methods mentioned in this part of the documentation also work in combination with a configuration for touch input (basic or advanced). A complete non-touch configuration provides the full functionality of the module (for effects on system notifications and party mode see advanced touch configuration) with one exception: There is no touch interface to change the color presets. Therefore this must be done within `color_presets.JSON`. The file can be found inside the module's folder (subfolder `presets`). It can be modified via the GUI of the system used or with the following commands in a console / terminal (LXTerminal on Raspberry Pi):

```bash
cd ~/MagicMirror/modules/MMM-FrameLight/presets           #adapt path to module folder if it is not the default folder
nano color_presets.JSON
```

There are 10 presets inside of `color_presets.JSON` (`"color0"` to `"color9"`). Each of them is assigned an RGB value in string format, that can be customized (e. g. `"rgb(255, 0, 0)"`, format important for data transfer to Python). After customization, the file must be saved (when using nano editor: press `Ctrl + O` to save and `Ctrl + X` to quit file).

Controlling the module via MagicMirror² system notifications **requires the use of additional modules**, that are able to send such notifications. Examples for modules like this are [MMM-Remote-Control by Jopyth](https://github.com/Jopyth/MMM-Remote-Control) (integrating MMM-FrameLight into home automations, examples below) and voice control modules in general (choose according to need for features). On smart mirrors with touch input it is also possible to visualize touch gestures using the Swipe Move effect with custom notifications defined inside the configuration of [MMM-Touch by gfischershaw](https://github.com/gfischershaw/MMM-Touch) and MMM-FrameLight (s. advanced touch configuration). The following table lists the MagicMirror² system notifications, that can be used to control MMM-FrameLight:

| Notification | Action |
| :-------- | :------- |
| FRAMELIGHT_ON | turn on lights |
| FRAMELIGHT_OFF | turn off lights |
| FRAMELIGHT_PARTY_ON | turn on party mode |
| FRAMELIGHT_PARTY_OFF | turn off party mode and lights<br>(fewer commands required to turn off) |
| FRAMELIGHT_PRESET | switch to another preset<br>(requires `payload` with **value 0 to 9**)|

The following examples show how to integrate MMM-FrameLight into home automations using cURL and the REST API of [MMM-Remote-Control by Jopyth](https://github.com/Jopyth/MMM-Remote-Control) (must be set up in advance):

- Notification without payload via GET method (adapt IP and notification to individual case):

  ```bash
  curl -X GET http://IP.of.smart.mirror:8080/api/notification/FRAMELIGHT_ON
  ```
- Notification with payload via POST method (adapt IP, notification and payload to individual case):

  ```bash
  curl -X POST -H "Content-Type: application/json" -d "{\"preset\": 9}" http://IP.of.smart.mirror:8080/api/notification/FRAMELIGHT_PRESET
  ```

<img src="../media/README Media/images/break.png" width="1000" height="40">

## Contribution

The module can be extended by contributing own lighting effects via [pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests). This chapter describes the necessary steps to do this.

1. **Forking the module**
   
   The first step is to create a [fork](https://docs.github.com/en/get-started/quickstart/fork-a-repo) of MMM-FrameLight by pressing the corresponding button (upper right corner of Github page).

2. **Implementing own effect code**
   
   The lighting effects of MMM-FrameLight are written in [Python](https://www.python.org/) and can be found in the file "MMM-FrameLight_LED_Control.py". New lighting effects must be programmed to match the scheme of existing effects (basic structure, variables, parameter order,...) and have to be stored in the "Effects" section of the code. If unsuitable configuration of an effect can lead to a crash of the module, the code must have safety precautions to avoid it (cf. code of "Wobbling Segments" effect). Required helper functions shall be included in the "Helpers" section and shall not be redundant. The transfer of data from "node_helper.js" to the new lighting effect function inside the Python script is enabled by inserting a new `elif` case into the "start_effect" function.

3. **Adding effect description**
   
   Since each effect has its own parameters, the order of which is crucial, it is essential to add a description of every new effect to the "Effect configuration" section of the "README.md" file. The scheme of the existing descriptions shall be adopted.

4. **Creating a pull request**
   
   The last step is to create a [pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests) by pressing the "Compare & pull request" button (appears after first commit).

<img src="../media/README Media/images/break.png" width="1000" height="40">

## Special Thanks

This chapter mentions people without whom the realization of this project would not have been possible. Thank you!

- [ViatorisBaculum](https://github.com/ViatorisBaculum) (co-creator of MMM-FrameLight, js genius)

- [mako017](https://github.com/mako017) (programming consultant)

- [jaames](https://github.com/jaames) (creator of awesome open source color picker [iro.js](https://github.com/jaames/iro.js) (modified for this project) and the beautiful break line for the README)

- [ladyada](https://github.com/ladyada) ([Adafruit Industries](https://github.com/adafruit)) (creator of lighting effect examples for [Adafruit CircuitPython DotStar](https://github.com/adafruit/Adafruit_CircuitPython_DotStar))

<img src="../media/README Media/images/break.png" width="1000" height="40">

## License

MMM-FrameLight is licensed under [Mozilla Public License 2.0](https://github.com/RaspiManu/MMM-FrameLight/blob/master/LICENSE) (MPL-2.0).
