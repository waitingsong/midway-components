import { RuleType } from '@midwayjs/validate'


export const commonValidSchemas = {
  id: RuleType.number().min(1).max(Number.MAX_SAFE_INTEGER),
  name50: RuleType.string().trim().min(1).max(50),
  bigintString: RuleType.string().trim().min(1).max(30),
  dateString: RuleType.date(),
  /** 雪花算法int结果字符串 */
  snowflakeString: RuleType.string().trim().min(1).max(19),
  /** 分页查询每页面最大记录数 */
  pageSizeMax: RuleType.number().min(1).max(1000),
}

