import asyncio
from datetime import datetime as dt
from decimal import Decimal
from pprint import pprint
import time

import aiohttp
from bs4 import BeautifulSoup as BS

from etl import dynamo


async def get_yahoo_rates(session, *pairs):
    pairs = ", ".join(pairs)
    url = "http://query.yahooapis.com/v1/public/yql?" \
          "q=select * from yahoo.finance.xchange " \
          "where pair in ('{}')" \
          "&env=store://datatables.org/alltableswithkeys".format(pairs)
    async with session.get(url) as response:
        assert response.status == 200
        return await response.read()


def format_yahoo_datetime(_date, _time):
    res = dt.strptime(_date + _time, "%m/%d/%Y%I:%M%p")
    return str(res)


async def get_currency_rates(loop, *pairs):
    async with aiohttp.ClientSession(loop=loop) as session:
        data = await get_yahoo_rates(session, *pairs)
        print(data)
        soup = BS(data.decode("utf-8"), "xml")
        rates = soup.results.find_all("rate")
        rates = [{"Name": r.Name.text,
                  "Rate": Decimal(r.Rate.text),
                  "Provider": "yahoo",
                  "Datetime": format_yahoo_datetime(r.Date.text, r.Time.text)}
                 for r in rates]

        print(time.ctime())
        pprint(rates)
        dynamo.batch_put(table_name="currency_rates", items=rates)


loop = asyncio.get_event_loop()
loop.run_until_complete(get_currency_rates(loop,
                                           "USDPLN", "EURPLN", "EURUSD", "GBPPLN",
                                           "EURGBP", "USDGBP", "CHFPLN", "EURCHF",
                                           "USDCHF", "GBPCHF", "PLNUAH", "USDUAH",
                                           "EURUAH"))
