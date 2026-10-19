#!/bin/sh
# Runs every code-snippet check that does not need a browser. Exit code is non-zero if anything fails.
# Needs Node 22+, Python 3, JDK 17+ and g++ (C++17).
set -e
cd "$(dirname "$0")"
node cov.cjs
node extract.cjs
node jstest.cjs && echo "JavaScript checks passed"
python3 pytest_.py
sh build_java_test.sh
sh build_cpp_test.sh
echo "ALL SNIPPET CHECKS PASSED"
