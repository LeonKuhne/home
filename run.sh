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
  (
    cd $export_dir
    python -m http.server 8000
  )
}

function serve-bg {
  export_dir=$1
  script=$(readlink -f $0)
  nohup $script serve > /dev/null 2>&1 &
  echo $!
}

function start {
  export_dir=$1
  build $export_dir
  pid=$(serve-bg $export_dir)
  echo "serving $pid"
  trap "stop $pid" EXIT SIGTERM SIGINT
}

function stop {
  pid=$1
  echo "killing $pid"
  kill $pid
}

function hotreload {
  export_dir=$1
  start $export_dir
  waitforchanges $export_dir
}

function waitforchanges {
  export_dir=$1
  inotifywait -r -e modify,move,create,delete src | 
    while read dir action file; do
      echo "Detected change, reloading service... $dir, $action, $file"
      build $export_dir
    done
  waitforchanges $@
}

function run {
  echo "running with $1"
  export_dir="docs"
  if [ "$1" == "serve" ]; then serve "$export_dir";
  else hotreload $export_dir; fi
}

run $@