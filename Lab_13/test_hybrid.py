import asyncio
from hybrid_manager import FileManagerHybrid

def my_callback(error, result):
    if error:
        print(f"   ❌ Ошибка в колбэке: {error}")
    else:
        print(f"   ✅ Колбэк выполнился: {result}")

async def main():
    manager = FileManagerHybrid('./test-hybrid-data')
    print("=== ЗАДАНИЕ 3: ГИБРИДНЫЙ ПОДХОД ===\n")

    try:
        print("1. Обычный колбэк:")
        manager.save_with_callback('test_cb.txt', 'Данные для колбэка', my_callback)

        print("\n2. Async/await:")
        path_async = await manager.save_with_async('test_async.txt', 'Данные для async')
        print(f"   ✅ Async метод вернул: {path_async}")

        print("\n3. Гибридный метод:")
        path_hybrid = await manager.save_hybrid('test_hybrid.txt', 'Гибридные данные', my_callback)
        print(f"   ✅ Гибридный метод вернул: {path_hybrid}")

        print("\n✅ Задание 3 выполнено.")
    except Exception as e:
        print(f"\n❌ Критическая ошибка: {e}")

if __name__ == "__main__":
    asyncio.run(main())
