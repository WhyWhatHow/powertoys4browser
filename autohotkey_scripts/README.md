## AutoHotkey AHK Script

This AutoHotkey (AHK) script provides the following functionality for controlling volume and audio output devices:

### Functionality

- **Increase Volume**: Ctrl + Alt + ArrowUp
- **Decrease Volume**: Ctrl + Alt + ArrowDown
- **Toggle Mute**: Ctrl + Alt + F12
- **Toggle Audio Output Device**: Ctrl + Alt + F11 (only two devices)

### Usage

1. Install AutoHotkey if you haven't already.
2. Copy the script code into a new text file.
3. Configure the audio output devices by modifying the `device1` and `device2` variables in the script. Set them to represent your audio output devices.
4. Save the text file with a `.ahk` extension (e.g., `volume_control.ahk`).
5. Double-click the `.ahk` file to run the script.
6. The script will now be active and respond to the defined hotkey combinations.

> Note: Make sure to update the path `"G:/tool/AutoHotkey/nircmd-x64/nircmd.exe"` in the script's `Run` function calls to point to the correct location of the `nircmd.exe` utility on your system.

Feel free to modify the script according to your preferences and requirements.
