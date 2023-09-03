#!/bin/sh
set -ex

export DOLLAR='$'

envsubst < nginx.conf.template > nginx.conf

exec "$@"