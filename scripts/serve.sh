#!/bin/bash
(
  cd ../public
  python -m http.server 8000
)