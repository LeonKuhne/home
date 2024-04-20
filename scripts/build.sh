#!/bin/bash
# remove last deployment
if [ -d "../public" ]; then
  rm -r ../public
fi

# start fresh
mkdir ../public

# compile
pug < ../src/index.pug > ../public/index.html # markdown
sass ../src/styles.scss:../public/styles.css # styles
cp ../src/*.js ../public/ # code
