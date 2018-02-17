import boto3


dynamodb = boto3.resource("dynamodb")


def batch_put(table_name, items):
    table = dynamodb.Table(table_name)
    with table.batch_writer() as batch:
        for item in items:
            batch.put_item(Item=item)


# dynamo.batch_put(table_name="currency_rates", items=rates)