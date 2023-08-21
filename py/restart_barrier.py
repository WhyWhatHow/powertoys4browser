import os
import platform
import time

def restart_barrier():
    # 判断操作系统类型
    os_type = platform.system()

    if os_type == 'Windows':
        # Windows 平台
        # 停止 barrier.exe 进程
        os.system('net start barrier')
        os.system('taskkill /F /IM barrier.exe')
        os.system('taskkill /F /IM barriers.exe')
        print('barrier.exe shutdown')

        time.sleep(1)

        # 重启 barrier.exe（TODO [whywhathow] [2023/8/21] [must]   请根据实际路径修改）
        os.startfile(r'C:\tool\Barrier\barrier.exe')
        print('barrier.exe restarting')
    elif os_type == 'Linux':
        # Linux 平台
        # TODO: 编写 Linux 版本的脚本

        print('Linux version not implemented yet.')
    else:
        print('Unsupported operating system.')

restart_barrier()
