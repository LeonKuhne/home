#!/bin/bash

export_dir=docs
nohup python -m http.server 8000 -d $export_dir > /dev/null 2>&1 &
home_pid=$!
trap "kill $home_pid" EXIT SIGTERM SIGINT
echo "serving on http://localhost:8000 under pid: $home_pid"

function waitforchanges() {
  . ./scripts/build.sh
  code=$(inotifywait -r -e modify,move,create,delete src | 
    while read; do echo "continue"; done
  )
  if [ "$code" != "continue" ]; then return 1; fi
	waitforchanges
}

waitforchanges