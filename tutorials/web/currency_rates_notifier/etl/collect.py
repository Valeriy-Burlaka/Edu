from datetime import datetime as dt
from decimal import Decimal
from pprint import pprint

import requests
from bs4 import BeautifulSoup as BS


def get_yahoo_rates(*pairs):
    pairs = ["USDPLN", "EURPLN", "EURUSD"]
    pairs = ", ".join(pairs)
    url = "http://query.yahooapis.com/v1/public/yql?" \
          "q=select * from yahoo.finance.xchange " \
          "where pair in ('{}')" \
          "&env=store://datatables.org/alltableswithkeys".format(pairs)
    resp = requests.get(url)
    assert resp.status_code == 200
    return resp.text


def format_yahoo_datetime(_date, _time):
    res = dt.strptime(_date + _time, "%m/%d/%Y%I:%M%p")
    return str(res)


def main():
    data = get_yahoo_rates()
    print(data)

    soup = BS(data.decode("utf-8"), "xml")
    rates = soup.results.find_all("rate")
    rates = [{"Name": r.Name.text,
              "Rate": Decimal(r.Rate.text),
              "Provider": "yahoo",
              "Datetime": format_yahoo_datetime(r.Date.text, r.Time.text)}
             for r in rates]

    pprint(rates)

    # parse & pack & format
    # put to dynamo
    pass


if __name__ == '__main__':
    main()




