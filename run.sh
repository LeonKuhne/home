#!/bin/bash

function clean {
  export_dir=$1
  if [ -d $export_dir ]; then rm -r $export_dir; fi
  mkdir $export_dir
}

function compile {
  export_dir=$1
  pug -p src/index.pug < src/index.pug > $export_dir/index.html # markdown
  sass src/styles.scss:$export_dir/styles.css # styles
  cp src/*.js $export_dir # code
  cp src/**/*.js $export_dir # code
}

function build {
  clean $1
  compile $1
}

function serve {
  export_dir=$1
  nohup python -m http.server 8000 -d $export_dir > /dev/null 2>&1 &
  pid=$!
  trap "kill $pid" EXIT SIGTERM SIGINT
  echo "serving $pid on http://localhost:8000"
}

function hotreload {
  export_dir=$1
  serve $export_dir
  build $export_dir
  waitforchanges $export_dir
}

function waitforchanges {
  export_dir=$1
  build $export_dir
  code=$(inotifywait -r -e modify,move,create,delete src | 
    while read; do echo "continue"; done
  )
  if [ "$code" == "continue" ]; then waitforchanges $@; fi
}

hotreload "docs"