import { RuleType } from '@midwayjs/validate'


export const taskManValidSchemas = {
  taskId: RuleType.number().integer().min(1),
  taskTypeId: RuleType.number().integer().min(1),
  taskTypeVer: RuleType.number().integer().min(1),
  json: RuleType.object(),
  date: RuleType.date(),
  process: RuleType.number().integer().min(1).max(100),
  rows: RuleType.number().integer().min(0).max(1000),
  timeoutIntv: RuleType.string().trim().min(2).max(50),
  text: RuleType.string().trim().max(1000000).default('').empty(''),
  list: RuleType.array().items(RuleType.string().trim().max(1000000)),
  // taskTypeVerList: RuleType.alternatives().try(
  //   RuleType.array().items(RuleType.number().integer().min(1)),
  //   RuleType.string().valid('*'),
  // ),
  taskTypeVerList: RuleType.alternatives([
    RuleType.array().items(RuleType.number().integer().min(1)),
    RuleType.string().valid('*'),
  ]),
}

