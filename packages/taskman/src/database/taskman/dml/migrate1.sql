--

CREATE SEQUENCE tb_task_task_type_id_seq AS int4 START WITH 100;

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
-- ALTER TABLE tb_task_type OWNER TO "chery";

--

INSERT INTO tb_task_type VALUES (1, 'default');
INSERT INTO tb_task_type VALUES (2, 'task 2');
INSERT INTO tb_task_type VALUES (3, 'task 3');
INSERT INTO tb_task_type VALUES (4, 'task 4');
INSERT INTO tb_task_type VALUES (5, 'task 5');
INSERT INTO tb_task_type VALUES (6, 'task 6');
INSERT INTO tb_task_type VALUES (7, 'task 7');
INSERT INTO tb_task_type VALUES (8, 'task 8');
INSERT INTO tb_task_type VALUES (9, 'task 9');

--

ALTER TABLE tb_task ADD COLUMN  task_type_id int4 NOT NULL DEFAULT 1;
ALTER TABLE tb_task ADD COLUMN  task_type_ver int4 NOT NULL DEFAULT 1;

ALTER TABLE tb_task_archive ADD COLUMN  task_type_id int4 NOT NULL DEFAULT 1;
ALTER TABLE tb_task_archive ADD COLUMN  task_type_ver int4 NOT NULL DEFAULT 1;

--
DROP VIEW IF EXISTS vi_task;
CREATE VIEW vi_task AS
  SELECT task_id, task_state, expect_start, started_at,
    is_timeout, timeout_intv, ctime, mtime, task_type_id, task_type_ver
    FROM tb_task
  UNION ALL
  SELECT task_id, task_state, expect_start, started_at,
    is_timeout, timeout_intv, ctime, mtime, task_type_id, task_type_ver
    FROM tb_task_archive
;

COMMENT ON VIEW vi_task IS 'TM任务队列视图';

--
ALTER TABLE tb_task ADD FOREIGN KEY (task_type_id) REFERENCES tb_task_type(task_type_id) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE tb_task_archive ADD FOREIGN KEY (task_type_id) REFERENCES tb_task_type(task_type_id) ON DELETE RESTRICT ON UPDATE CASCADE;

--
