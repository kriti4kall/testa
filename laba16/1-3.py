from flask import Flask, request, jsonify
from datetime import datetime
import time
from flask_compress import Compress
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

app = Flask(__name__)

books_database = [
    {"id": 1, "title": "Война и мир", "author": "Толстой", "year": 1869}
]
next_book_id = 2

# ЗАДАНИЕ 1 (Базовый уровень): Создание простого HTTP-сервера

@app.route('/')
def home_page():
    current_datetime = datetime.now().strftime("%d.%m.%Y %H:%M:%S")
    html = f"""
    <h1>Лабораторная работа №16</h1>
    <p>Студент: Тискович Ян Юрьевич</p>
    <p>Группа: ББМО-01-23</p>
    <p>Текущая дата и время: {current_datetime}</p>
    <p>Приветственное сообщение: Добро пожаловать на сервер Flask </p>

    <h3>Список доступных маршрутов:</h3>
    <ul>
        <li><a href="/">Главная (/)</a></li>
        <li><a href="/about">О разработчике (/about)</a></li>
        <li><a href="/contacts">Контакты (/contacts)</a></li>
        <li><a href="/api/books">Список всех книг (GET /api/books)</a></li>
        <li><a href="/api/books/search?author=Толстой">Поиск книг по автору (/api/books/search?author=Толстой)</a></li>
    </ul>
    """
    return html


@app.route('/about')
def about_page():
    return """
    <h1>О разработчике</h1>
    <p>Студент: Тискович Ян Юрьевич</p>
    <p>Группа: ББМО-01-23</p>
    <p>Изучаю создание серверов , а как у вас дела?</p>
    """


@app.route('/contacts')
def contacts_page():
    return """
    <h1>Контактная информация</h1>
    <p>Email: ytiskovich@bk.ru</p>
    <p>Телефон: +375 (29) 833 27 80</p>
    """

# ЗАДАНИЕ 2 (Средний уровень): Обработка различных HTTP-методов и маршрутов

@app.route('/api/books', methods=['GET'])
def get_all_books():
    return jsonify(books_database)


@app.route('/api/books/<int:book_id>', methods=['GET'])
def get_book_by_id(book_id):
    book = next((b for b in books_database if b['id'] == book_id), None)
    if not book:
        return jsonify({"error": "Книга не найдена", "status": 404}), 404
    return jsonify(book)


@app.route('/api/books', methods=['POST'])
def create_book():
    global next_book_id
    request_data = request.get_json()

    if not request_data or 'title' not in request_data or 'author' not in request_data:
        return jsonify({"error": "Поля 'title' и 'author' обязательны", "status": 400}), 400

    new_book = {
        "id": next_book_id,
        "title": request_data['title'],
        "author": request_data['author'],
        "year": request_data.get('year', 2024)
    }
    books_database.append(new_book)
    next_book_id += 1

    return jsonify(new_book), 201


@app.route('/api/books/<int:book_id>', methods=['PUT'])
def update_book(book_id):
    request_data = request.get_json()

    if not request_data:
        return jsonify({"error": "Тело запроса не может быть пустым", "status": 400}), 400

    book_index = next((i for i, b in enumerate(books_database) if b['id'] == book_id), None)

    if book_index is None:
        return jsonify({"error": "Книга не найдена", "status": 404}), 404

    if 'title' in request_data:
        books_database[book_index]['title'] = request_data['title']
    if 'author' in request_data:
        books_database[book_index]['author'] = request_data['author']
    if 'year' in request_data:
        books_database[book_index]['year'] = request_data['year']

    return jsonify(books_database[book_index])


@app.route('/api/books/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    book_index = next((i for i, b in enumerate(books_database) if b['id'] == book_id), None)

    if book_index is None:
        return jsonify({"error": "Книга не найдена", "status": 404}), 404

    deleted_book = books_database.pop(book_index)
    return jsonify({"message": f"Книга '{deleted_book['title']}' успешно удалена", "id": book_id})


@app.route('/api/books/search', methods=['GET'])
def search_books():
    author_query = request.args.get('author', '').lower()
    if not author_query:
        return jsonify({"error": "Укажите параметр ?author=...", "status": 400}), 400

    found_books = [b for b in books_database if author_query in b['author'].lower()]
    return jsonify(found_books)


# ЗАДАНИЕ 3 (Продвинутый уровень): Middleware и обработка ошибок

# 3.1 Middleware логирования
@app.before_request
def log_request_start():
    request.start_time = time.time()


@app.after_request
def log_request_end(response):
    if hasattr(request, 'start_time'):
        duration_ms = (time.time() - request.start_time) * 1000
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{current_time}] {request.method} {request.path} {response.status_code} - {duration_ms:.0f}ms")
    return response


# 3.2 Middleware сжатия (Compression)
Compress(app)
# 3.3 Middleware ограничения скорости (Rate Limiter)
limiter = Limiter(
    key_func=get_remote_address,
    app=app,
    default_limits=["100 per minute"],
    storage_uri="memory://"
)

# 3.4 Middleware обработки ошибок (Централизованный)
@app.errorhandler(400)
def bad_request(error):
    return jsonify({"error": "Невалидные данные запроса", "status": 400}), 400


@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Ресурс или книга не найдены", "status": 404}), 404


@app.errorhandler(429)
def rate_limit_exceeded(error):
    return jsonify({"error": "Слишком много запросов. Попробуйте позже", "status": 429}), 429


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Внутренняя ошибка сервера", "status": 500}), 500


# 3.5 Тестирование ошибок
@app.route('/error')
def trigger_error():
    raise Exception("Это тестовая синхронная ошибка для проверки обработчика ошибок")
@app.route('/async-error')
def trigger_async_error():
    def faulty_task():
        raise ValueError("Ошибка внутри имитации асинхронной задачи")

    faulty_task()
    return jsonify({"message": "Этот текст не будет достигнут"})

if __name__ == '__main__':
    print(" Сервер успешно запущен на порту 3000")
    print(" Откройте в браузере: http://localhost:3000")
    app.run(host='0.0.0.0', port=3000, debug=True)
