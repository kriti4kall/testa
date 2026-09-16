import os
import asyncio

class FileManagerHybrid:
    def __init__(self, base_dir='./data_hybrid'):
        self.base_dir = base_dir
        if not os.path.exists(self.base_dir):
            os.makedirs(self.base_dir)

    def save_with_callback(self, filename, content, callback):
        filepath = os.path.join(self.base_dir, filename)
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            callback(None, filepath)
        except Exception as e:
            callback(e, None)

    async def save_with_async(self, filename, content):
        filepath = os.path.join(self.base_dir, filename)
        try:
            await asyncio.sleep(0.01)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return filepath
        except Exception as e:
            raise Exception(f"Ошибка записи {filename}: {e}")

    async def save_hybrid(self, filename, content, callback=None):
        filepath = os.path.join(self.base_dir, filename)
        try:
            await asyncio.sleep(0.02)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            
            if callback is not None:
                callback(None, filepath)
            return filepath
        except Exception as e:
            if callback is not None:
                callback(e, None)
            raise Exception(f"Ошибка в гибридном методе: {e}")
