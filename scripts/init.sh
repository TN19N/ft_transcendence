#!/bin/bash

set -e

# Create .env file from .env.template
./tools/envsubst-Darwin-x86_64.exe < .env.template > .env

# create nessasary folders
export $(cat .env | grep -v "#" | xargs)

mkdir -p $DATABASE_DIR