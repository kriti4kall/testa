from http.server import BaseHTTPRequestHandler, HTTPServer
def pi_gen(digits):
    base = 10 ** (digits + 10)

    def arc(x):
        total, p, k = 0, base // x, 1
        while p > 0:
            total += (p // k) * (1 if (k // 2) % 2 == 0 else -1)
            p, k = p // (x * x), k + 2
        return total

    res = str(4 * (4 * arc(5) - arc(239)) // 10**10)
    return f"3.{res[1:digits + 1]}"
class YanServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html; charset=utf-8")
        self.end_headers()

        fio = "Тискович Ян Юрьевич"
        group = "477"
        num = 24
        pi = pi_gen(num)
        self.wfile.write(f"{fio}<br>{group}<br>Пи: {pi}".encode("utf-8"))
bot_server = HTTPServer(("localhost", 3000), YanServer)
print("Запустился")
bot_server.serve_forever()
