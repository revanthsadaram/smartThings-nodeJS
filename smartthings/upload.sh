#!bin/#!/usr/bin/env bash

7z a -tzip index.zip *

aws lambda update-function-code --function-name demo --zip-file fileb://index.zip

rm index.zip