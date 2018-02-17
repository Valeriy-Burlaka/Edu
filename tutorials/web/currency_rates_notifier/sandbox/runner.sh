#!/usr/bin/env bash

BASEDIR=/Users/valeriy/Dropbox/Edu/workspace/edu/tutorials/web/currency_rates_notifier

export AWS_ACCESS_KEY_ID=AKIAIK35AYYAMMQ3RVKQ
export AWS_SECRET_ACCESS_KEY=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
export AWS_DEFAULT_REGION=us-east-1
export PYTHONPATH=$BASEDIR:$PYTHONPATH

source /Users/valeriy/.virtualenvs/app-yJiBaPR0/bin/activate

python $BASEDIR/sandbox/get_currency_rates.py
