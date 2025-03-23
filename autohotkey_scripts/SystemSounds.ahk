#Requires AutoHotkey v2.0
/*
ctrl + alt + ArrowUp :      volume++
ctrl + alt + ArrowDwon :    volume--
ctrl + alt + F12 :          toggle mute
ctrl + alt + F11 :          toggle audio output device (only two devices.)

*/
; device1, device2 represent your audio output device, you need set it like i do. please make it simple and short.
device1 := "Speakers"
device2 := "BL2480T "

ToggleSoundOutputDevice(device){
    ;MsgBox("before: " device)
    device := SubStr(device, 1, 8)
    ;MsgBox("after: " device)
    if( device = device1){
        device := device2
    }else {
        device := device1

    }
    ;MsgBox("Selected device: " device)
    ; todo must need to change your nircmd position
    Run("G:/tool/AutoHotkey/nircmd-x64/nircmd.exe setdefaultsounddevice " device)

}

VolumeOSD(v) {
    SoundSetVolume v ; Use a string "+1" or "-1"
    try if shellProvider := ComObject("{C2F03A33-21F5-47FA-B4BB-156362A2F239}", "{00000000-0000-0000-C000-000000000046}") {
        try if flyoutDisp := ComObjQuery(shellProvider, "{41f9d2fb-7834-4ab6-8b1b-73e74064b465}", "{41f9d2fb-7834-4ab6-8b1b-73e74064b465}")
            ComCall(3, flyoutDisp, "int", 0, "uint", 0)
    }
}

; volume ++
^!Up::VolumeOSD("+5") ; ctrl + alt + arrowUp
; volume --
^!Down::VolumeOSD("-5") ; ctrl + alt + arrowDown

; toggle sound mute or not
^!F12:: ;ctrl  + alt + F12
    {
        SoundSetMute -1
    }
^!F11:: ;ctrl + alt + F11
    {
        ToggleSoundOutputDevice(SoundGetName())
    }
