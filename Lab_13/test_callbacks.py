from file_operations_callback import FileManagerCallback

file_manager = FileManagerCallback('./test-data-cb')
print("=== ТЕСТИРОВАНИЕ КОЛБЭКОВ (Python) ===\n")

# 1. Создание файла
file_manager.create_file('test1.txt', 'Привет, мир!', lambda err, path: (
    print(f"  ❌ Ошибка: {err}") if err else (
        print(f"  ✅ Файл создан: {path}"),
        # 2. Чтение файла (вложенный колбэк)
        file_manager.read_file('test1.txt', lambda err, content: (
            print(f"  ❌ Ошибка чтения: {err}") if err else (
                print(f"  ✅ Содержимое: '{content}'"),
                # 3. Статистика (ещё глубже)
                file_manager.get_file_stats('test1.txt', lambda err, stats: (
                    print(f"  ❌ Ошибка статистики: {err}") if err else (
                        print(f"  ✅ Статистика: Размер={stats['size']} байт, Изменён={stats['modified']}"),
                        # 4. Удаление (максимальная вложенность)
                        file_manager.delete_file('test1.txt', lambda err: (
                            print(f"  ❌ Ошибка удаления: {err}") if err else print("  ✅ Файл успешно удалён. Обратите внимание на глубину вложенности!")
                        ))
                    )
                ))
            )
        ))
    )
))
