from datetime import datetime
def setup(app):
    def write(event_name, data=""):
        now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        line = f"[{now}] {event_name}: {data}\n"
        with open("logs.txt", "a", encoding="utf-8") as f:
            f.write(line)
    app.on('server:started', lambda port: write('server:started', f"порт {port}"))
    app.on('server:stopped', lambda: write('server:stopped'))
    app.on('request:received', lambda method, url: write('request:received', f"{method} {url}"))
