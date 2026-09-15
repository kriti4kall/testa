import os
import time

class FileManagerCallback:
    def __init__(self, base_dir='./data_callback'):
        self.base_dir = base_dir
        if not os.path.exists(base_dir):
            os.makedirs(base_dir)
            print(f"✅ Создана директория: {base_dir}")

    def create_file(self, filename, content, callback):
        filepath = os.path.join(self.base_dir, filename)
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            callback(None, filepath)
        except Exception as e:
            callback(e, None)

    def read_file(self, filename, callback):
        filepath = os.path.join(self.base_dir, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            callback(None, content)
        except Exception as e:
            callback(e, None)

    def get_file_stats(self, filename, callback):
        filepath = os.path.join(self.base_dir, filename)
        try:
            stats = os.stat(filepath)
            callback(None, {
                'size': stats.st_size,
                'created': time.ctime(stats.st_ctime),
                'modified': time.ctime(stats.st_mtime),
                'is_file': os.path.isfile(filepath)
            })
        except Exception as e:
            callback(e, None)

    def delete_file(self, filename, callback):
        filepath = os.path.join(self.base_dir, filename)
        try:
            os.remove(filepath)
            callback(None)
        except Exception as e:
            callback(e)
