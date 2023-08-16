#!/bin/sh
set -ex

envsubst < nginx.conf.template > nginx.conf

exec "$@"