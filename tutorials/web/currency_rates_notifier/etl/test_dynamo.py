from __future__ import print_function

import boto3


dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("currency_rates")
print(table.creation_date_time)

response = table.get_item(Key={
    'Name': 'EUR/CHF',
    'Datetime': '2017-03-22 21:00:00'
})
print(dir(response))
item = response.get('Item')
print(item)

table.put_item()
