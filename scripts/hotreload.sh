#!/bin/bash
./build.sh
fswatch -d ../src | xargs -n1 -I{} ./build.sh
