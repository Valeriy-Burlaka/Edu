from tornado.ioloop import IOLoop
import tornado.web
import tornado.httpserver
import aiohttp
from tornado.platform.asyncio import AsyncIOMainLoop
import asyncio


class MainHandler(tornado.web.RequestHandler):
    async def get(self):
        r = await aiohttp.get('http://google.com/')
        text = await r.text()
        self.write("Hello, world, text is: {}".format(text))

if __name__ == "__main__":
    AsyncIOMainLoop().install()
    app = tornado.web.Application([
        (r"/", MainHandler),
    ])
    server = tornado.httpserver.HTTPServer(app)
    server.bind(1234, '127.0.0.1')
    server.start()
    asyncio.get_event_loop().run_forever().start()