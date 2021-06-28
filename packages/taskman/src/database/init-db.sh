#!/bin/bash
set -e

echo -e "\n"

echo "\l" | psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$POSTGRES_USER -d postgres
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$POSTGRES_USER -d $POSTGRES_DB -bq \
  -f ddl/enum.sql \
  -f ddl/common.sql \
  -f ddl/tb_task.sql \
  -f ddl/tb_task_payload.sql \
  -f ddl/tb_task_progress.sql \
  -f ddl/tb_task_archive.sql \

#psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$POSTGRES_USER -d $POSTGRES_DB -bq -1 \
#  -f dml/init.sql \

psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$POSTGRES_USER -d $POSTGRES_DB -c "\d+"

