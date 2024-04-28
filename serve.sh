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

function serve {
  export_dir=$1
  (
    cd $1
    python -m http.server 8000
  )
}

function hotstart {
  clean $1
  compile $1
  serve $1
}

hotstart "docs"