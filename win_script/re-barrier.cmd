@echo off

REM 停止 barrier.exe 进程
taskkill /F /IM barrier.exe
taskkill /F /IM barriers.exe

echo "barrier.exe shutdown"

REM 重启 barrier.exe（请根据实际路径修改）
start "barrier.exe" "C:\tool\Barrier\barrier.exe"
echo "barrier.exe restarting"

REM 结束
