import pygetwindow as gw
import win32gui
import win32con

def bring_process_to_foreground(pid):
    # 通过 PID 获取窗口句柄
    hwnd = win32gui.GetForegroundWindow()
    win32gui.ShowWindow(hwnd, win32con.SW_MINIMIZE)  # 最小化当前窗口

    # 使用 pygetwindow 库根据 PID 获取进程对应的窗口
    process_window = gw.win32handle.WindowFromProcessId(pid)

    if process_window:
        process_window.maximize()  # 最大化进程窗口
        process_window.activate()  # 激活进程窗口

# 指定进程的 PID
# process_pid = 25396  # 替换为实际的进程 PID
process_pid = 8504
# 调用函数将进程调度到当前窗口
bring_process_to_foreground(process_pid)