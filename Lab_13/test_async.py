import asyncio
from file_operations_async import FileManagerAsync

async def main():
    file_manager = FileManagerAsync('./test-data-async')
    print("=== ТЕСТИРОВАНИЕ ASYNC/AWAIT (Python) ===\n")

    try:
        # 1. Создание
        path = await file_manager.create_file('test1.txt', 'Привет из asyncio!')
        print(f"  ✅ Файл создан: {path}")

        # 2. Чтение
        content = await file_manager.read_file('test1.txt')
        print(f"  ✅ Содержимое: '{content}'")

        # 3. Параллельное создание (аналог Promise.all)
        print("\n  ⏳ Создание нескольких файлов параллельно...")
        files = [
            {'filename': 'test2.txt', 'content': 'Файл 2'},
            {'filename': 'test3.txt', 'content': 'Файл 3'}
        ]
        paths = await file_manager.create_multiple_files(files)
        print(f"  ✅ Создано файлов: {len(paths)}")

        # 4. Очистка
        await file_manager.delete_file('test1.txt')
        await file_manager.delete_file('test2.txt')
        await file_manager.delete_file('test3.txt')
        print("\n  ✅ Все операции завершены! Код плоский и читаемый.")

    except Exception as e:
        print(f"  ❌ Ошибка: {e}")


# Запуск асинхронной функции
asyncio.run(main())
