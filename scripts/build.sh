#!/bin/bash

function clean() {
  if [ -d $export_dir ]; then rm -r $export_dir; fi
  mkdir $export_dir
}

function compile() {
  pug -p src/index.pug < src/index.pug > $export_dir/index.html # markdown
  sass src/styles.scss:$export_dir/styles.css # styles
  /bin/cp src/*.js $export_dir    # code
  /bin/cp src/**/*.js $export_dir # code
  echo "home.leonk.dev" > $export_dir/CNAME   # cname
  /bin/cp favicon.ico $export_dir # favicon
}

debug "Building..."
clean
compile