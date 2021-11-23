#!/bin/bash
set -e

psql -V
# netstat -tunpl
# dig postgres

echo -e "\n"

SQL_DIR='./packages/taskman/src/database/'

cd "$SQL_DIR"
. ./init-db.sh
cd -

