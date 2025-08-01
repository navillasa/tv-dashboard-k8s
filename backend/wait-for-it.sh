#!/usr/bin/env sh
#   Wait for a given TCP host/port to be available

set -e

TIMEOUT=15
QUIET=0
HOST=""
PORT=""

while [[ $# -gt 0 ]]
do
key="$1"
case $key in
    --timeout)
    TIMEOUT="$2"
    shift
    shift
    ;;
    --quiet)
    QUIET=1
    shift
    ;;
    *)
    if [[ "$HOST" == "" ]]; then
      HOST="$1"
    elif [[ "$PORT" == "" ]]; then
      PORT="$1"
    fi
    shift
    ;;
esac
done

if [[ "$HOST" == "" || "$PORT" == "" ]]; then
  echo "Usage: $0 host port [--timeout seconds] [--quiet]"
  exit 1
fi

for i in $(seq 1 $TIMEOUT)
do
  if nc -z "$HOST" "$PORT"; then
    exit 0
  fi
  if [[ $QUIET -ne 1 ]]; then
    echo "Waiting for $HOST:$PORT... ($i/$TIMEOUT)"
  fi
  sleep 1
done

echo "Timeout waiting for $HOST:$PORT"
exit 1
