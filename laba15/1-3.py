from flask import Flask, request, jsonify, render_template_string
from datetime import datetime
import time
app = Flask(__name__)
users_database = [
    {"id": 1, "name": "Тискович Ян", "group": "группа 477"}
]
next_user_id = 2
@app.before_request
def log_request_start():
    request.start_time = time.time()


@app.after_request
def log_request_end(response):
    if hasattr(request, 'start_time'):
        duration_ms = (time.time() - request.start_time) * 1000
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{current_time}] {request.method} {request.path} - {duration_ms:.0f}ms")
    return response


# ЗАДАНИЕ 3.2: Middleware обработки ошибок

@app.errorhandler(404)
def handle_not_found(error):
    return jsonify({"error": "Ресурс не найден", "status": 404}), 404


@app.errorhandler(400)
def handle_bad_request(error):
    return jsonify({"error": "Невалидные данные запроса", "status": 400}), 400


@app.errorhandler(401)
def handle_unauthorized(error):
    return jsonify({"error": "Неавторизован", "status": 401}), 401


@app.errorhandler(500)
def handle_internal_error(error):

    return jsonify({"error": "Внутренняя ошибка сервера", "status": 500}), 500


# ЗАДАНИЕ 1: Базовый уровень (HTML страница)

@app.route('/')
def home_page():
    """Главная страница с информацией о лабораторной работе"""
    current_datetime = datetime.now().strftime("%d.%m.%Y %H:%M:%S")

    html_template = """
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <title>Лабораторная работа №15</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; color: #333; }
            h1 { color: #2c3e50; }
            .info-box { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 5px solid #007bff; }
        </style>
    </head>
    <body>
        <h1>Лабораторная работа №15</h1>
        <div class="info-box">
            <p><strong>Группа:</strong> ББМО-01-23</p>
            <p><strong>Текущая дата и время:</strong> {{ current_datetime }}</p>
            <p><strong>Приветственное сообщение:</strong> Добро пожаловать на сервер, созданный с помощью фреймворка Flask!</p>
        </div>
    </body>
    </html>
    """
    return render_template_string(html_template, current_datetime=current_datetime)

# ЗАДАНИЕ 2: Средний уровень (REST API)

@app.route('/api/users', methods=['GET'])
def get_all_users():
    return jsonify(users_database)


@app.route('/api/users', methods=['POST'])
def create_user():
    global next_user_id
    request_data = request.get_json()

    if not request_data or 'name' not in request_data or 'group' not in request_data:
        return jsonify({"error": "Поля 'name' и 'group' обязательны"}), 400
    new_user = {
        "id": next_user_id,
        "name": request_data['name'],
        "group": request_data['group']
    }
    users_database.append(new_user)
    next_user_id += 1

    return jsonify(new_user), 201


@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):

    request_data = request.get_json()

    if not request_data or 'name' not in request_data or 'group' not in request_data:
        return jsonify({"error": "Поля 'name' и 'group' обязательны"}), 400

    user_index = next((i for i, user in enumerate(users_database) if user['id'] == user_id), None)

    if user_index is None:
        return jsonify({"error": "Пользователь не найден"}), 404

    users_database[user_index]['name'] = request_data['name']
    users_database[user_index]['group'] = request_data['group']

    return jsonify(users_database[user_index])


@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):

    user_index = next((i for i, user in enumerate(users_database) if user['id'] == user_id), None)

    if user_index is None:
        return jsonify({"error": "Пользователь не найден"}), 404

    deleted_user = users_database.pop(user_index)

    return jsonify({"message": f"Пользователь с ID {user_id} успешно удален", "deleted_user": deleted_user})


# ЗАДАНИЕ 3: Продвинутый уровень


def require_authorization(func):


    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return jsonify({"error": "Отсутствует заголовок Authorization"}), 401

        return func(*args, **kwargs)

    wrapper.__name__ = func.__name__
    return wrapper

@app.route('/protected')
@require_authorization
def protected_route():

    return jsonify({"message": "Доступ разрешен! Это защищенный маршрут."})


@app.route('/error')
def error_route():
    raise Exception("Это тестовая ошибка для проверки работы error-handling middleware")

if __name__ == '__main__':
    print(" Сервер успешно запущен на порту 3000")
    print(" Откройте в браузере: http://localhost:3000")
    app.run(host='0.0.0.0', port=3000, debug=True)
