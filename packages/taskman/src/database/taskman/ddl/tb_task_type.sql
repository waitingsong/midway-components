--
CREATE TABLE tb_task_type (
  task_type_id int4 NOT NULL DEFAULT nextval('tb_task_task_type_id_seq'),
  task_type_name varchar(255) NOT NULL,
  ctime TIMESTAMP(6) NOT NULL DEFAULT now(),
  mtime TIMESTAMP(6),
  PRIMARY KEY (task_type_id)
)
WITH (fillfactor=100);

COMMENT ON TABLE tb_task_type IS 'TM任务类型';

CREATE INDEX CONCURRENTLY ON tb_task_type USING BRIN (ctime);
CREATE INDEX CONCURRENTLY ON tb_task_type USING BRIN (mtime);

--
