import psutil
import re 
processes = psutil.process_iter()

pattern = re.compile(r'zerotier\w*')
process_info = ""
for process in processes:
    if pattern.match(process.name()):
        process_info += f"Process ID: {process.pid}, Process Name: {process.name()}\n"

with open("running_processes.txt", "w") as file:
    file.write(process_info)

print("All done.")
