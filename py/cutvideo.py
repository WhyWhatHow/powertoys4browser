import subprocess
from pathlib import Path
import sys

def parse_time(time_str):
    """解析时间字符串，支持：
    - 6位数字紧凑格式（如010203 → 01:02:03）
    - 标准格式（hh:mm:ss、mm:ss、ss）
    返回转换后的标准时间格式和秒数"""
    # 处理6位数字的紧凑格式（hhmmss）
    if time_str.isdigit() and len(time_str) == 6:
        hh = time_str[0:2]
        mm = time_str[2:4]
        ss = time_str[4:6]
        # 验证时间有效性
        if int(mm) >= 60 or int(ss) >= 60:
            raise ValueError(f"无效的时间值: {time_str}（分钟和秒必须小于60）")
        time_str = f"{hh}:{mm}:{ss}"

    # 转换为秒数
    parts = list(map(int, time_str.split(':')))
    if len(parts) == 3:
        sec = parts[0] * 3600 + parts[1] * 60 + parts[2]
    elif len(parts) == 2:
        sec = parts[0] * 60 + parts[1]
    elif len(parts) == 1:
        sec = parts[0]
    else:
        raise ValueError(f"无效的时间格式: {time_str}，支持格式：6位数字(hhmmss)、hh:mm:ss、mm:ss、ss")

    return time_str, sec

def print_usage():
    print("使用方法：")
    print("  支持的时间格式：")
    print("  - 6位数字紧凑格式（如010203表示01:02:03）")
    print("  - 标准格式（hh:mm:ss、mm:ss、ss）")
    print("  1. 带标记模式：")
    print("     同时指定开始和结束时间：cut.py 视频文件 -ss 时间 -to 时间")
    print("     只指定开始时间：cut.py 视频文件 -ss 时间")
    print("     只指定结束时间：cut.py 视频文件 -to 时间")
    print("  2. 简洁模式：")
    print("     同时指定开始和结束时间：cut.py 视频文件 开始时间 结束时间")
    print("     只指定开始时间：cut.py 视频文件 开始时间")

def main():
    if len(sys.argv) < 2:
        print("错误：请提供输入文件路径")
        print_usage()
        return 1

    input_file = sys.argv[1]
    remaining_args = sys.argv[2:]

    # 检查输入文件是否存在
    input_path = Path(input_file)
    if not input_path.exists():
        print(f"错误：文件 '{input_path}' 不存在")
        return 1

    start_time = None
    end_time = None
    i = 0

    # 解析剩余参数
    while i < len(remaining_args):
        arg = remaining_args[i]
        if arg == "-ss":
            if i + 1 < len(remaining_args):
                start_time = remaining_args[i+1]
                i += 2
            else:
                print("错误：-ss 需要指定时间值")
                return 1
        elif arg == "-to":
            if i + 1 < len(remaining_args):
                end_time = remaining_args[i+1]
                i += 2
            else:
                print("错误：-to 需要指定时间值")
                return 1
        else:
            # 处理无标记的时间参数
            if start_time is None:
                start_time = arg
            elif end_time is None:
                end_time = arg
            else:
                print(f"错误：未知参数 '{arg}'")
                return 1
            i += 1

    # 检查至少提供了一个时间参数
    if start_time is None and end_time is None:
        print("错误：至少需要指定一个时间参数")
        print_usage()
        return 1

    # 解析并验证时间
    parsed_start = None
    parsed_end = None
    try:
        if start_time:
            parsed_start, start_sec = parse_time(start_time)
        if end_time:
            parsed_end, end_sec = parse_time(end_time)

        # 检查时间顺序
        if parsed_start and parsed_end and start_sec >= end_sec:
            print(f"错误：开始时间 {parsed_start} 不能晚于结束时间 {parsed_end}")
            return 1
    except ValueError as e:
        print(f"错误：{e}")
        return 1

    # 提取文件名和扩展名
    file_stem = input_path.stem
    file_ext = input_path.suffix

    # 构建输出文件名的时间部分
    if parsed_start and parsed_end:
        time_part = f"{parsed_start}_{parsed_end}"
    elif parsed_start:
        time_part = parsed_start
    else:  # 只有结束时间
        time_part = f"_{parsed_end}"

    # 替换时间中的冒号
    sanitized_time = time_part.replace(':', '')
    output_file = f"{file_stem}_{sanitized_time}{file_ext}"

    # 构建ffmpeg命令
    ffmpeg_cmd = ['ffmpeg', '-i', str(input_path)]

    if parsed_start:
        ffmpeg_cmd.extend(['-ss', parsed_start])
    if parsed_end:
        ffmpeg_cmd.extend(['-to', parsed_end])

    ffmpeg_cmd.extend(['-c', 'copy', output_file])

    # 显示将要执行的命令
    print(f"执行命令：{' '.join(ffmpeg_cmd)}")

    # 执行ffmpeg命令
    try:
        result = subprocess.run(
            ffmpeg_cmd,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        print(f"视频处理完成，输出文件：{output_file}")
        return 0
    except subprocess.CalledProcessError as e:
        print(f"处理失败：{e.stderr}")
        return 1
    except Exception as e:
        print(f"发生错误：{str(e)}")
        return 1

if __name__ == "__main__":
    main()
