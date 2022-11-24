#MMM-FrameLight
#Description:   Python script for controlling WS2801 RGB LED strip
#Authors:       RaspiManu and ViatorisBaculum
#License:       MPL-2.0

#Effects Rainbow Cycle Successive, Rainbow Cycle, Rainbow Colors and related helpers are based on the following example:
#URL:           https://github.com/adafruit/Adafruit_CircuitPython_DotStar/tree/master/examples
#Author:        2021 ladyada for Adafruit Industries
#License:       MIT

################################################################################################################################################################################################
#Standard Functions

#Name:          Change Color
#Description:   fills LED strip with defined color
def set_color(leds, color1=(255,255,255)):
    leds.fill(color1)
    leds.show()

#Name:          Deinitialise LED Strip
#Description:   deinitialises LED Strip to shut it down
def deinitialise_LED_strip(leds):
    leds.deinit()

################################################################################################################################################################################################
#Effects

#Name:          Blink Color
#Description:   lets LED strip blink in defined color
def blink_color(leds, activeColor, color1=(255,255,255), cycles=2, time_per_step=0.5):
    
    #set color
    color_blink = color1
    
    #effect loop
    for i in range(cycles):
        leds.fill(color_blink)
        leds.show()
        time.sleep(time_per_step)
        leds.fill(activeColor)
        leds.show()
        time.sleep(time_per_step)

#Name:          Rainbow Cycle Successive
#Description:   fills LED strip with rainbow colors successively while defined color is in background
def rainbow_cycle_successive(leds, color1=(0,0,0), cycles = 2, time_per_step=0.02):
    
    #set color
    color_background = color1
    
    #effect loop
    for i in range(cycles):
        
        #fill background
        leds.fill(color_background)
        
        #fill LED strip with rainbow
        for j in range(len(leds)):
            leds[j] = color_wheel(((j * 256 // len(leds))) % 256)           #helper function color_wheel to define color
            leds.show()
            time.sleep(time_per_step)

#Name:          Rainbow Cycle
#Description:   lets all rainbow colors spin around at once
def rainbow_cycle(leds, cycles=2, time_per_step=0.005):
    
    #effect loop
    for i in range(cycles):
        for j in range(256):                                                #256 color steps per LED for one cycle
            for k in range(len(leds)):
                leds[k] = color_wheel(((k * 256 // len(leds)) + j) % 256)   #helper function color_wheel to define color
            leds.show()
            time.sleep(time_per_step)

#Name:          Rainbow Colors
#Description:   shifts through all rainbow colors while LED strip only shows one color at a time
def rainbow_colors(leds, cycles = 2, time_per_step=0.05):
    
    #effect loop
    for i in range(cycles):
        for j in range(256):                                                #256 color steps per LED for one cycle
            for k in range(len(leds)):
                leds[k] = color_wheel(((256 // len(leds) + j)) % 256)       #helper function color_wheel to define color
            leds.show()
            time.sleep(time_per_step)

#Name:          Docking Trains
#Description:   spawns "trains" at the end of the LED strip moving to the start until strip is filled
#Special:       switches the defined colors every cycle
def docking_trains(leds, color1=(255,0,0), color2=(0,255,0), cycles=4, time_per_step=0.01, length=10):
    
    #set number of trains
    trains_per_cycle = math.ceil(len(leds)/length)                          #math.ceil rounds up so the LED strip gets completely filled
    
    #set colors
    color_background = color1
    color_moving = color2
    
    #fill background
    leds.fill(color_background)
    leds.show()
    
    #effect loop
    for i in range(cycles):
        
        #train movement
        for j in range(trains_per_cycle):
            for k in reversed(range(j*length, len(leds))):
                leds[k] = color_moving
                if k < len(leds)-length:
                    leds[k+length] = color_background
                leds.show()
                time.sleep(time_per_step)
                
        #color switch after every cycle
        if color_background == color1:
            color_background = color2
            color_moving = color1
        elif color_background == color2:
            color_background = color1
            color_moving = color2
        time.sleep(0.5)

#Name:          KITT
#Description:   imitates the LED bar of K.I.T.T. from Knight Rider
def KITT(leds, color1=(0,0,0), color2=(255,0,0), cycles=2, time_per_step=0.005, length=10):
    
    #set colors
    color_background = color1
    color_moving = color2
    
    #fill background
    leds.fill(color_background)
    
    #fill start segment for effect
    for i in range(0,length):
        leds[i] = color_moving
    leds.show()
    
    #effect loop
    for j in range(cycles):
        
        #move from start to end of LED strip
        for k in range(length,len(leds)):
            leds[k] = color_moving
            leds[k-length] = color_background
            leds.show()
            time.sleep(time_per_step)
            
        #move from end back to start of LED strip
        for l in reversed(range(length,len(leds))):
            leds[l] = color_background
            leds[l-length] = color_moving
            leds.show()
            time.sleep(time_per_step)

#Name:          Wobbling Segments
#Description:   splits LED strip into given number of segments with two different colors and lets them wobble
#Special:       has a safety function that deflects to the next best number of segments if the given number is not feasible
def wobbling_segments(leds, color1=(0,0,0), color2=(255,0,0), cycles=2, time_per_step=0.1, segments=10, wobble_factor=1):
    
    #set segment options with check
    #checking given segment value and find next fitting one, if given one does not fit
    
    #print("number of LEDs: ", len(leds))                                               #Debug command
    #print("given number of segments: ", segments)                                      #Debug command
    
    #given segment value is not feasible
    if not segments % 2 == 0 and not len(leds) / segments % 1 == 0:
        #print("searching for fitting values")                                          #Debug command
        divisors = []
        possible_segments = []
        
        #check for divisors of LED count
        for i in range(1,len(leds)+1):
            if len(leds) / i % 1 == 0:
                divisors.append(i)
                
        #check for divisors that fit to effect
        for j in divisors:
            if len(leds) / j % 2 == 0:
                possible_segments.append(int(len(leds) / j))
                
        #check for fitting segment value that is closest to user defined segment value
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
        
        #set segment length
        segment_length_fit = int(len(leds)/ segments_fit)
        #print("divisors of number of LEDs: ", divisors)                                #Debug command
        #print("possible numbers of segments: ", possible_segments)                     #Debug command
    
    #given segment value is feasible
    else:
        #print("given values are fitting")                                              #Debug command
        segments_fit = segments
        segment_length_fit = int(len(leds) / segments_fit)

    #print("fitting number of segments: ", segments_fit)                                #Debug command
    #print("fitting length of segments: ", segment_length_fit)                          #Debug command
    
    #set colors
    color_background = color1
    color_moving = color2
    
    #set wobble steps
    wobble_steps = math.ceil(wobble_factor*segment_length_fit)  #math.ceil rounds up wobble steps to fitting LED count

    #set start of effect with fitting parameters
    leds.fill(color_background)
    for i in range(0,segment_length_fit):
        for j in range(0,segments_fit,2):
            leds[i+j*segment_length_fit] = color_moving
    leds.show()
    
    #effect loop
    for k in range(cycles):
        
        #wobble towards the end of LED strip
        for l in range(wobble_steps):
            for m in range(0,segments_fit,2):
                leds[l+m*segment_length_fit+segment_length_fit] = color_moving
                leds[l+m*segment_length_fit] = color_background
            leds.show()
            time.sleep(time_per_step)
        
        #wobble towards the start of LED strip
        for n in reversed(range(wobble_steps)):
            for o in range(0,segments_fit,2):
                leds[n+o*segment_length_fit+segment_length_fit] = color_background
                leds[n+o*segment_length_fit] = color_moving
            leds.show()
            time.sleep(time_per_step)

#Name:          Swipe Move
#Description:   shows a mono or bidirectional swipe move
def swipe_move(leds, color1=(0,0,0), color2=(0,255,0), cycles=2, time_per_step=0.02, movement_start=1, movement_direction="right", movement_width=10, bar_length=3, offset_start=0):
    
    #set colors
    color_background = color1
    color_moving = color2
    
    #effect loop
    for i in range(cycles):
        
        #set start of effect
        leds.fill(color_background)
        leds.show()
        time.sleep(time_per_step)
        
        #show swipe move
        for j in range(movement_width):
            
            #swipe move in right direction
            if movement_direction == "right":
                
                #set LED positions of front and back of moving bar
                led_position_bar_front = position_wheel(movement_start - 1 + offset_start + j, len(leds))                           #helper function position_wheel to set feasible LED position
                led_position_bar_back = position_wheel(movement_start - 1 + offset_start + j - bar_length, len(leds))               #helper function position_wheel to set feasible LED position
                
                #change colors at front and back of moving bar
                leds[led_position_bar_front] = color_moving
                #print(led_position_bar_front, "(LED #", led_position_bar_front + 1, ") now color_moving")                          #Debug command
                if j >= bar_length:
                    leds[led_position_bar_back] = color_background
                    #print(led_position_bar_back, "(LED #", led_position_bar_back + 1, ") now color_background")                    #Debug command
            
            #swipe move in left direction
            elif movement_direction == "left":
                
                #set LED positions of front and back of moving bar
                led_position_bar_front = position_wheel(movement_start - 1 - offset_start - j, len(leds))                           #helper function position_wheel to set feasible LED position
                led_position_bar_back = position_wheel(movement_start - 1 - offset_start - j + bar_length, len(leds))               #helper function position_wheel to set feasible LED position
                
                #change colors at front and back of moving bar
                leds[led_position_bar_front] = color_moving
                #print(led_position_bar_front, "(LED #", led_position_bar_front + 1, ") now color_moving")                          #Debug command
                if j >= bar_length:
                    leds[led_position_bar_back] = color_background
                    #print(led_position_bar_back, "(LED #", led_position_bar_back + 1, ") now color_background")                    #Debug command
            
            #swipe move in both directions
            elif movement_direction == "both":
                
                #swipe move in right direction
                
                #set LED positions of front and back of bar moving in right direction
                led_position_bar_right_front = position_wheel(movement_start - 1 + offset_start + j, len(leds))                     #helper function position_wheel to set feasible LED position
                led_position_bar_right_back = position_wheel(movement_start - 1 + offset_start + j - bar_length, len(leds))         #helper function position_wheel to set feasible LED position
                
                #change colors at front and back of bar moving in right direction
                leds[led_position_bar_right_front] = color_moving
                #print(led_position_bar_right_front, "(LED #", led_position_bar_right_front + 1, ") now color_moving")              #Debug command
                if j >= bar_length:
                    leds[led_position_bar_right_back] = color_background
                    #print(led_position_bar_right_back, "(LED #", led_position_bar_right_back + 1, ") now color_background")        #Debug command
                
                #swipe move in left direction
                
                #if number of LEDs is even --> center of effect between 2 LEDs
                if len(leds) % 2 == 0:
                    
                    #set LED positions of front and back of bar moving in left direction
                    led_position_bar_left_front = position_wheel(movement_start - 2 - offset_start - j, len(leds))                  #helper function position_wheel to set feasible LED position
                    led_position_bar_left_back = position_wheel(movement_start - 2 - offset_start - j + bar_length, len(leds))      #helper function position_wheel to set feasible LED position
                    
                    #change colors at front and back of bar moving in left direction
                    leds[led_position_bar_left_front] = color_moving
                    #print(led_position_bar_left_front, "(LED #", led_position_bar_left_front + 1, ") now color_moving")            #Debug command
                    if j >= bar_length:
                        leds[led_position_bar_left_back] = color_background
                        #print(led_position_bar_left_back, "(LED #", led_position_bar_left_back + 1, ") now color_background")      #Debug command
                
                #if number of LEDs is uneven --> center of effect is 1 LED
                else:
                    
                    #set LED positions of front and back of bar moving in left direction
                    led_position_bar_left_front = position_wheel(movement_start - 1 - offset_start - j, len(leds))                  #helper function position_wheel to set feasible LED position
                    led_position_bar_left_back = position_wheel(movement_start - 1 - offset_start - j + bar_length, len(leds))      #helper function position_wheel to set feasible LED position
                    
                    #change colors at front and back of bar moving in left direction
                    leds[led_position_bar_left_front] = color_moving
                    #print(led_position_bar_left_front, "(LED #", led_position_bar_left_front + 1, ") now color_moving")            #Debug command
                    if j >= bar_length:
                        leds[led_position_bar_left_back] = color_background
                        #print(led_position_bar_left_back, "(LED #", led_position_bar_left_back + 1, ") now color_background")      #Debug command
            
            #refresh LED strip
            leds.show()
            #print("--- next step ---")                                                                                             #Debug command
            time.sleep(time_per_step)

################################################################################################################################################################################################
#Helpers

#Name:          Create Tuple
#Description:   converts RGB values from node helper (string) into tuple
def create_tuple(strRGB):
    strRGB = strRGB.replace('rgb', '')
    arrRGB = make_tuple(strRGB)
    return arrRGB

#Name:          Start Effect
#Description:   starts effect with defined parameters from node helper
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
    elif strEffect == "SwipeMove":
        swipe_move(leds, color1=create_tuple(arrColors[0]), color2=create_tuple(arrColors[1]), cycles=arrOptions[0], time_per_step=arrOptions[1], movement_start=arrOptions[2], movement_direction=arrOptions[3], movement_width=arrOptions[4], bar_length=arrOptions[5], offset_start=arrOptions[6])

    if not data["partyMode"]:
        set_color(leds, color1=tupleActiveColor)

#Name:          Color Wheel
#Description:   interpolates RGB colors for rainbow effects
def color_wheel(pos):
    if pos < 85:
        return (pos * 3, 255 - pos * 3, 0)
    elif pos < 170:
        pos -= 85
        return (255 - pos * 3, 0, pos * 3)
    else:
        pos -= 170
        return(0, pos * 3, 255 - pos * 3)

#Name:          Position Wheel
#Description:   resets LED positions for effects that go beyond the borders of the strip
def position_wheel(pos, led_count):
    if pos > led_count - 1 or pos < 0:
        pos = pos % led_count
    return(pos)

################################################################################################################################################################################################
#Main Code

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

data = sys.stdin.readlines()    #to receive data from node_helper
if data != []:
    data = json.loads(data[0])

#Initialise LEDs
if "LEDType" in data and "LEDCount" in data:
    if data["LEDType"] == "WS2801":
        leds = adafruit_ws2801.WS2801(oclock, odata, data["LEDCount"], brightness=bright, auto_write=False)

#Start Effect
if "options" in data:                                                                                                                           #is there a defined effect with options?
    start_effect(leds, strEffect=data["effect"], strActiveColor=data["activeColor"], arrColors=data["colors"], arrOptions=data["options"])      #start defined effect with options
elif "effect" in data:                                                                                                                          #is there a defined effect without options?
    start_effect(leds, strEffect=data["effect"], strActiveColor=data["activeColor"], arrColors=data["colors"], arrOptions=[""])                 #start defined effect without options

#Reactivate party mode in case it was on before effect
while data["partyMode"]:
    for partyElement in data["PartyMatrix"]:
        start_effect(leds, strEffect=partyElement["effect"], strActiveColor=data["activeColor"], arrColors=partyElement["colors"], arrOptions=partyElement["options"])

#Deinitialise LEDs
if "effect" in data: # is there a defined effect?
    if data["effect"] == "lightOff":
        deinitialise_LED_strip(leds)
