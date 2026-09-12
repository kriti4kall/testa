import sys
from flask import Flask, request
class AppServer:
    def __init__(self):
        self.app = Flask(__name__)
        self.listeners = {}
        self._setup_routes()
    def on(self, event_name, callback):
        if event_name not in self.listeners:
            self.listeners[event_name] = []
        self.listeners[event_name].append(callback)
    def emit(self, event_name, *args, **kwargs):
        if event_name in self.listeners:
            for callback in self.listeners[event_name]:
                callback(*args, **kwargs)
    def _setup_routes(self):
        @self.app.route('/', defaults={'path': ''}, methods=['GET', 'POST', 'PUT', 'DELETE'])
        @self.app.route('/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
        def catch_all(path):
            self.emit('request:received', method=request.method, url=request.path)
            return "Hello from Event-Driven Server!"
    def start(self, port):
        self.port = port
        self.emit('server:started', port=port)
        self.app.run(port=port, debug=False, use_reloader=False)
    def stop(self):
        self.emit('server:stopped')
        sys.exit(0)
app = AppServer()
app.on('server:started', lambda port: print(f" Сервер запущен на порту {port}"))
app.on('request:received', lambda method, url: print(f" Получен запрос: {method} {url}"))
app.on('server:stopped', lambda: print(" Сервер остановлен"))
if __name__ == '__main__':
    from logger import setup_logger
    setup_logger(app)
    app.start(3000)
