import os
import asyncio
import time

class FileManagerAsync:
    def __init__(self, base_dir='./data_async'):
        self.base_dir = base_dir
        if not os.path.exists(base_dir):
            os.makedirs(base_dir)
            print(f"✅ Создана директория: {base_dir}")

    async def create_file(self, filename, content):
        filepath = os.path.join(self.base_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        await asyncio.sleep(0.01) 
        return filepath

    async def read_file(self, filename):
        filepath = os.path.join(self.base_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        await asyncio.sleep(0.01)
        return content

    async def get_file_stats(self, filename):
        filepath = os.path.join(self.base_dir, filename)
        stats = os.stat(filepath)
        return {
            'size': stats.st_size,
            'created': time.ctime(stats.st_ctime),
            'modified': time.ctime(stats.st_mtime),
            'is_file': os.path.isfile(filepath)
        }

    async def delete_file(self, filename):
        filepath = os.path.join(self.base_dir, filename)
        os.remove(filepath)
        await asyncio.sleep(0.01)

    async def create_multiple_files(self, files_list):
        tasks = [self.create_file(f['filename'], f['content']) for f in files_list]
        return await asyncio.gather(*tasks)
