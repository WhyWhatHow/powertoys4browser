import psutil

# 获取所有正在运行的进程列表
processes = psutil.process_iter()

# 构建进程信息字符串
process_info = ""
for process in processes:
    process_info += f"进程ID: {process.pid}，进程名称: {process.name()}\n"

# 将进程信息写入文件
with open("running_processes.txt", "w") as file:
    file.write(process_info)

print("进程信息已保存到 running_processes.txt 文件中。")