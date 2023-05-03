#!/bin/bash

set -e

# clean created folders
if [ -e ".env" ]; then
    if [ "$1" = "stop" ]; then
        docker compose down
    elif [ "$1" = "clean" ]; then
        export $(cat .env | grep -v "#" | xargs)
        docker compose down --volumes
        rm -rf $DATABASE_DIR .env
    fi
fi