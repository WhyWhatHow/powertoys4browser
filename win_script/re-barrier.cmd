@echo off

REM 停止 barrier.exe 进程
taskkill /F /IM barrier.exe
taskkill /F /IM barriers.exe

echo "barrier.exe shutdown"
ping -n 1 127.0.0.1 > nul  REM 停顿 1 秒

REM 重启 barrier.exe（请根据实际路径修改）
start "barrier.exe" "C:\tool\Barrier\barrier.exe"
echo "barrier.exe restarting"

REM 结束
