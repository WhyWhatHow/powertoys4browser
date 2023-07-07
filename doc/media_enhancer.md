# Media Player Enhancer

---
This script is designed to enhance the HTML5 video player with keyboard shortcuts and other features, and provides feedback on key presses. It enables users to control video playback more conveniently and efficiently.

## Demo:
![media_enhancer.gif](../assets/media_enhancer.gif)

## Features:

This script enhances your media player experience by providing features such as:

1. Play/Pause: Easily play or pause your media with a simple command.
2. Speed Control: Adjust the playback speed of your media to fit your preference.
3. Volume Control: Adjust the volume of your media without having to touch your device's volume.
4. Full-Screen Toggle: Quickly switch between full-screen and normal viewing modes.
5. Time Jump: Skip forward or backward in your media without having to manually scrub through.

These features aim to provide a more efficient and user-friendly media viewing experience.


## Installation Guide

1. Install a userscript manager in your browser. For example, Tampermonkey or Greasemonkey.
2. Click on the userscript manager icon in your browser and select "Create a new script..."
3. Copy the provided [script]( https://raw.githubusercontent.com/WhyWhatHow/powertoys4browser/master/js/media_enhancer.js) and paste it into the new script template in your userscript manager.
4. Save the script. It should now be installed and ready to use.


### Hint:
  
If you want to use this script for **local file system**, it worked. Something you need to do here.

You need to allow `Tampermonkey` to access `file URLs`. Right click on the tampermonkey, and allow this function. 
![local file system](https://cdn.jsdelivr.net/gh/whywhathow/image-hosting@main/img/202307071042974.png)


## Keyboard Shortcuts

- `←`: Rewind 5 seconds
- `→`: Fast forward 5 seconds
- `↑`: Increase volume
- `↓`: Decrease volume
- `F`: Toggle fullscreen
- `M`: Toggle mute
- `[`: Slow down playback
- `]`: Speed up playback
- `R`: Reset player settings
- `Q`: Show shortcuts reference
- `P` or `Space`: Toggle play
- `Esc`: Exit fullscreen

These shortcuts will only work when the video player is active.


## Websites:
- [x] Local file system
- [ ] Youtube 
- [ ] Bilibili
- [ ] twitter 
