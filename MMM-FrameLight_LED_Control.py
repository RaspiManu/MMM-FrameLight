#MMM-FrameLight
#Description:   Python script for controlling WS2801 RGB LED strip
#Authors:       RaspiManu and ViatorisBaculum
#License:       MIT

#Effects Rainbow Cycle Successive, Rainbow Cycle, Rainbow Colors and related helpers are based on the following example:
#URL:           https://github.com/adafruit/Adafruit_CircuitPython_DotStar/tree/master/examples
#Author:        2021 ladyada for Adafruit Industries
#License:       MIT

#########################################################################################################################
#Standard Functions

#Name:          Change Color
#Description:   Fills LED strip with defined color
def set_color(leds, color1=(255,255,255)):
    leds.fill(color1)
    leds.show()

#Name:          Deinitialise LED Strip
#Description:   Deinitialises LED Strip to shut it down
def deinitialise_LED_strip(leds):
    leds.deinit()

#########################################################################################################################
#Effects

#Name:          Blink Color
#Description:   Lets LED strip blink in defined color
def blink_color(leds, activeColor, color1=(255,255,255), cycles=2, time_per_step=0.5):
    color_blink = color1
    for i in range(cycles):
        leds.fill(color_blink)
        leds.show()
        time.sleep(time_per_step)
        leds.fill(activeColor)
        leds.show()
        time.sleep(time_per_step)

#Name:          Rainbow Cycle Successive
#Description:   Fills LED strip with rainbow colors successively while defined color is in background
def rainbow_cycle_successive(leds, color1=(0,0,0), cycles = 2, time_per_step=0.02):
    color_background = color1
    for i in range(cycles):
        leds.fill(color_background)
        for j in range(len(leds)):
            leds[j] = wheel(((j * 256 // len(leds))) % 256)
            leds.show()
            time.sleep(time_per_step)

#Name:          Rainbow Cycle
#Description:   Lets all rainbow colors spin around at once
def rainbow_cycle(leds, cycles=2, time_per_step=0.005):
    for i in range(cycles):
        for j in range(256):
            for k in range(len(leds)):
                leds[k] = wheel(((k * 256 // len(leds)) + j) % 256)
            leds.show()
            time.sleep(time_per_step)

#Name:          Rainbow Colors
#Description:   Shifts through all rainbow colors while LED strip only shows one color at a time
def rainbow_colors(leds, cycles = 2, time_per_step=0.05):
    for i in range(cycles):
        for j in range(256):
            for k in range(len(leds)):
                leds[k] = wheel(((256 // len(leds) + j)) % 256)
            leds.show()
            time.sleep(time_per_step)

#Name:          Docking Trains
#Description:   Spawns "trains" at the end of the LED strip moving to the start until strip is filled
#Special:       Switches the defined colors every cycle
def docking_trains(leds, color1=(255,0,0), color2=(0,255,0), cycles=4, time_per_step=0.01, length=10):
    trains_per_cycle = math.ceil(len(leds)/length)
    color_background = color1
    color_moving = color2
    leds.fill(color_background)
    leds.show()
    for i in range(cycles):
        for j in range(trains_per_cycle):
            for k in reversed(range(j*length, len(leds))):
                leds[k] = color_moving
                if k < len(leds)-length:
                    leds[k+length] = color_background
                leds.show()
                time.sleep(time_per_step)
        if color_background == color1:
            color_background = color2
            color_moving = color1
        elif color_background == color2:
            color_background = color1
            color_moving = color2
        time.sleep(0.5)

#Name:          KITT
#Description:   Imitates the LED bar of K.I.T.T. from Knight Rider
def KITT(leds, color1=(0,0,0), color2=(255,0,0), cycles=2, time_per_step=0.005, length=10):
    color_background = color1
    color_moving = color2
    leds.fill(color_background)
    for i in range(0,length):
        leds[i] = color_moving
    leds.show()
    for j in range(cycles):
        for k in range(length,len(leds)):
            leds[k] = color_moving
            leds[k-length] = color_background
            leds.show()
            time.sleep(time_per_step)
        for l in reversed(range(length,len(leds))):
            leds[l] = color_background
            leds[l-length] = color_moving
            leds.show()
            time.sleep(time_per_step)

#Name:          Wobbling Segments
#Description:   Splits LED strip into given number of segments with two different colors and lets them wobble
def wobbling_segments(leds, color1=(0,0,0), color2=(255,0,0), cycles=2, time_per_step=0.1, segments=10, wobble_factor=1):

    #checking given segment value and find next fitting one, if given one does not fit
    #print("number of LEDs: ", len(leds))
    #print("given number of segments: ", segments)
    if not segments % 2 == 0 and not len(leds) / segments % 1 == 0:
        #print("searching for fitting values")
        divisors = []
        possible_segments = []
        for i in range(1,len(leds)+1):
            if len(leds) / i % 1 == 0:
                divisors.append(i)
        for j in divisors:
            if len(leds) / j % 2 == 0:
                possible_segments.append(int(len(leds) / j))
        possible_segments.sort()
        pos = bisect_left(possible_segments, segments)
        if pos == 0:
            segments_fit = possible_segments[0]
        elif pos == len(possible_segments):
            segments_fit = possible_segments[-1]
        else:
            before = possible_segments[pos - 1]
            after = possible_segments[pos]
            if after - segments < segments - before:
                segments_fit = after
            else:
                segments_fit = before
        segment_length_fit = int(len(leds)/ segments_fit)
        #print("divisors of number of LEDs: ", divisors)
        #print("possible numbers of segments: ", possible_segments)

    else:
        #print("given values are fitting")
        segments_fit = segments
        segment_length_fit = int(len(leds) / segments_fit)

    #print("fitting number of segments: ", segments_fit)
    #print("fitting length of segments: ", segment_length_fit)

    color_background = color1
    color_moving = color2
    wobble_steps = math.ceil(wobble_factor*segment_length_fit)

    #show effect with fitting parameters
    leds.fill(color_background)
    for i in range(0,segment_length_fit):
        for j in range(0,segments_fit,2):
            leds[i+j*segment_length_fit] = color_moving
    leds.show()
    for k in range(cycles):
        for l in range(wobble_steps):
            for m in range(0,segments_fit,2):
                leds[l+m*segment_length_fit+segment_length_fit] = color_moving
                leds[l+m*segment_length_fit] = color_background
            leds.show()
            time.sleep(time_per_step)
        for n in reversed(range(wobble_steps)):
            for o in range(0,segments_fit,2):
                leds[n+o*segment_length_fit+segment_length_fit] = color_background
                leds[n+o*segment_length_fit] = color_moving
            leds.show()
            time.sleep(time_per_step)

#########################################################################################################################
#Helpers

#Name:          Create Tuple
#Description:   Converts RGB values from node helper (string) into tuple
def create_tuple(strRGB):
    strRGB = strRGB.replace('rgb', '')
    arrRGB = make_tuple(strRGB)
    return arrRGB

#Name:          Start Effect
#Description:   Starts Effect with defined parameters from node helper
def start_effect(leds, strEffect, strActiveColor, arrColors = [''], arrOptions = ['']):
    tupleActiveColor = create_tuple(strActiveColor)
    if strEffect == "lightOn":
        set_color(leds, color1=create_tuple(arrColors[0]))
    elif strEffect == "setColor":
        set_color(leds, color1=create_tuple(arrColors[0]))
    elif strEffect == "BlinkColor":
        blink_color(leds, activeColor=tupleActiveColor, color1=create_tuple(arrColors[0]), cycles=arrOptions[0], time_per_step=arrOptions[1])
    elif strEffect == "RainbowCycleSuccessive":
        rainbow_cycle_successive(leds, color1=create_tuple(arrColors[0]), cycles=arrOptions[0], time_per_step=arrOptions[1])
    elif strEffect == "RainbowCycle":
        rainbow_cycle(leds, cycles=arrOptions[0], time_per_step=arrOptions[1])
    elif strEffect == "RainbowColors":
        rainbow_colors(leds, cycles=arrOptions[0], time_per_step=arrOptions[1])
    elif strEffect == "DockingTrains":
        docking_trains(leds, color1=create_tuple(arrColors[0]), color2=create_tuple(arrColors[1]), cycles=arrOptions[0], time_per_step=arrOptions[1], length=arrOptions[2])
    elif strEffect == "KITT":
        KITT(leds, color1=create_tuple(arrColors[0]), color2=create_tuple(arrColors[1]), cycles=arrOptions[0], time_per_step=arrOptions[1], length=arrOptions[2])
    elif strEffect == "WobblingSegments":
        wobbling_segments(leds, color1=create_tuple(arrColors[0]), color2=create_tuple(arrColors[1]), cycles=arrOptions[0], time_per_step=arrOptions[1], segments=arrOptions[2], wobble_factor=arrOptions[3])

#Name:          Wheel
#Description:   Interpolates between different hues
def wheel(pos):
    if pos < 85:
        return (pos * 3, 255 - pos * 3, 0)
    elif pos < 170:
        pos -= 85
        return (255 - pos * 3, 0, pos * 3)
    else:
        pos -= 170
        return(0, pos * 3, 255 - pos * 3)

#########################################################################################################################
#Main Loop

#Imports
import sys
import time
import math
import random
import board
import argparse
import json
import adafruit_ws2801
from bisect import bisect_left
from ast import literal_eval as make_tuple

#Definitions
oclock = board.SCLK
odata = board.MOSI
bright = 1.0
data = json.loads(sys.argv[1]) # receive data from node_helper

#Initialise LEDs
if "LEDType" in data and "LEDCount" in data:
    if data["LEDType"] == "WS2801":
        leds = adafruit_ws2801.WS2801(oclock, odata, data["LEDCount"], brightness=bright, auto_write=False)

#Start Effect
if "options" in data:                                                                                                                                           #is there a defined effect?
    start_effect(leds, strEffect=data["effect"], strActiveColor=data["activeColor"], arrColors=data["colors"], arrOptions=data["options"])                      #start defined effect
elif "effect" in data:
    start_effect(leds, strEffect=data["effect"], strActiveColor=data["activeColor"], arrColors=data["colors"], arrOptions=[""])

#Reactivate party mode in case it was on before effect
if "partyMode" in data:
    while data["partyMode"] == true:
        start_effect(leds, strEffect=data["PartyMatrix"]["effect"], strActiveColor=data["activeColor"], arrColors=data["PartyMatrix"]["colors"], arrOptions=["PartyMatrix"]["options"])


#Deinitialise LEDs
if "effect" in data: # is there a defined effect?
    if data["effect"] == "lightOff":
        deinitialise_LED_strip(leds)