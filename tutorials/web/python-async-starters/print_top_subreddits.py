# http://www.stackabuse.com/python-async-await-tutorial/
import asyncio
import json
import signal
import sys

import aiohttp


loop = asyncio.get_event_loop()
client = aiohttp.ClientSession(loop=loop)


async def get_json(client, url):
    async with client.get(url) as response:
        assert response.status == 200
        return await response.read()


async def get_reddit_top(subreddit, client):
    url = "https://www.reddit.com/r/" + subreddit + "/top.json?sort=top&t=day&limit=5"
    data = await get_json(client, url)

    data = json.loads(data.decode("utf-8"))
    for item in data["data"]["children"]:
        score = item["data"]["score"]
        title = item["data"]["title"]
        link = item["data"]["url"]
        print("{sc}: {t} ( {l} )".format(sc=score, t=title, l=link))

    print("\nDone with subreddit '{}'.\n".format(subreddit))


def signal_handler(signal, frame):
    loop.stop()
    client.close()
    sys.exit(0)


signal.signal(signal.SIGINT, signal_handler)

asyncio.ensure_future(get_reddit_top('python', client))
asyncio.ensure_future(get_reddit_top('programming', client))
asyncio.ensure_future(get_reddit_top('compsci', client))
loop.run_forever()
