--
CREATE TABLE tb_task (
  task_id int8 NOT NULL DEFAULT nextval('tb_task_task_id_seq'),
  task_state type_op_state NOT NULL DEFAULT 'init',
  expect_start TIMESTAMP(3) NOT NULL DEFAULT now(),
  started_at TIMESTAMP(6),
  is_timeout boolean NOT NULL DEFAULT false,
  timeout_intv interval NOT NULL DEFAULT '2h',
  task_type_id int4 NOT NULL DEFAULT 1,
  task_type_ver int4 NOT NULL DEFAULT 1,
  ctime TIMESTAMP(6) NOT NULL DEFAULT now(),
  mtime TIMESTAMP(6),
  PRIMARY KEY (task_id),
  FOREIGN KEY (task_type_id) REFERENCES tb_task_type ON UPDATE CASCADE ON DELETE RESTRICT
)
WITH (fillfactor=70);

COMMENT ON TABLE tb_task IS 'TM任务队列';

CREATE INDEX CONCURRENTLY ON tb_task USING BRIN (ctime);
CREATE INDEX CONCURRENTLY ON tb_task USING BRIN (mtime);

CREATE INDEX CONCURRENTLY tb_task_task_state_idx ON tb_task (task_state);
CREATE INDEX CONCURRENTLY tb_task_expect_start_task_state_idx
  ON tb_task USING BRIN (expect_start)
  WHERE task_state = 'init';

CREATE INDEX CONCURRENTLY tb_task_task_type_id_idx ON tb_task (task_type_id);
CREATE INDEX CONCURRENTLY tb_task_task_type_ver_idx ON tb_task (task_type_ver);

--
