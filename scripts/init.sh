#!/bin/bash

set -e

# Create .env file from .env.template
if [ $(uname) = "Darwin" ]; then
    ./tools/envsubst-Darwin-x86_64.exe < .env.template > .env
elif [ $(uname) = "Linux" ]; then
    ./tools/envsubst-Linux-x86_64.exe < .env.template > .env
fi