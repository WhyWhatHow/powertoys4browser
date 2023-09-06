import os

def merge_videos(folder_path, output_file, video_format='.mp4'):
    # 获取文件夹下指定格式的视频文件
    video_files = [file for file in os.listdir(folder_path) if file.endswith(video_format)]

    # 生成list.txt文件的内容
    file_list = '\n'.join([f"file '{os.path.join(folder_path, file)}'" for file in video_files])

    # 获取list.txt文件的完整路径
    list_file = os.path.join(folder_path, 'list.txt')

    # 将list.txt写入到文件中
    with open(list_file, 'w') as file:
        file.write(file_list)

    # 生成ffmpeg命令
    ffmpeg_command = f"ffmpeg -f concat -safe 0 -i {list_file} -c copy {output_file}"

    # 返回ffmpeg命令和list.txt文件路径
    return ffmpeg_command, os.path.abspath(list_file)
# 判断是否是视频文件 
def is_video_file(video_format):
    video_extensions = ['.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.m4v']

    # 判断文件扩展名是否在视频文件类型列表中
    if video_format in video_extensions:
        return True
    else:
        return False

# 示例用法
while True:
    folder_path = input("请输入包含视频的文件夹路径：")
    if not os.path.isdir(folder_path):
        print("输入的文件夹路径无效，请重新输入。")
        continue

    video_format = input("请输入视频文件的格式（例如mp4）：")
    video_format = '.' + video_format.lower()  # 将输入的视频格式转换为小写，并添加点号
    if is_video_file(video_format): 
        output_file = 'output_video' + video_format  # 输出文件放在当前文件夹内
        ffmpeg_command, list_file = merge_videos(folder_path, output_file, video_format)
        print(f"ffmpeg命令: {ffmpeg_command}")
        print(f"list.txt文件路径: {list_file}")
        break
    print("output video_format:",video_format)