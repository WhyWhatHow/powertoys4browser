import argparse
from PIL import Image

def get_gif_info(gif_path):
    with Image.open(gif_path) as im:
        # 获取图像大小
        width, height = im.size
        # 获取帧率
        try:
            duration = im.info['duration']
            fps = round(1000 / duration)
        except:
            fps = None
        # 返回结果
        return {
            'width': width,
            'height': height,
            'fps': fps
        }

if __name__ == '__main__':
    # 创建 ArgumentParser 对象
    parser = argparse.ArgumentParser(description='获取 GIF 图像的基本信息')

    # 添加参数
    parser.add_argument('gif_path', type=str, help='GIF 文件的路径')

    # 解析命令行参数
    args = parser.parse_args()

    # 调用 get_gif_info 函数
    gif_info = get_gif_info(args.gif_path)

    # 输出结果
    print(gif_info)
