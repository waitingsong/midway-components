import { RuleType } from '@midwayjs/validate'


const pageOrderBySchema = RuleType.object().keys({
  column: RuleType.string().trim()
    .min(1)
    .max(50),
  order: RuleType.string().trim()
    .valid('ASC', 'DESC', 'asc', 'desc'),
})
const pageOrderByArraySchema = RuleType.array().items(pageOrderBySchema)

export const commonValidSchemas = {
  number: RuleType.number(),
  int: RuleType.number().integer(),
  /** 自然数 */
  naturalNumber: RuleType.number().min(0)
    .max(Number.MAX_SAFE_INTEGER),
  /**
   * 大于等于0的正整数
   * @deprecated use naturalNumber instead
   */
  nonNegativeInteger: RuleType.number().min(0)
    .max(Number.MAX_SAFE_INTEGER),
  /** 正整数 */
  positiveInt: RuleType.number().min(1)
    .max(Number.MAX_SAFE_INTEGER),
  /** 负整数 */
  negativeInt: RuleType.number().max(-1)
    .max(-Number.MAX_SAFE_INTEGER),

  id: RuleType.number().min(1)
    .max(Number.MAX_SAFE_INTEGER),
  name50: RuleType.string().trim()
    .min(1)
    .max(50),
  bigintString: RuleType.string().trim()
    .min(1)
    .max(30),
  dateString: RuleType.date(),
  /** 雪花算法int结果字符串 */
  snowflakeString: RuleType.string().trim()
    .min(1)
    .max(19),
  /** 分页查询每页面最大记录数 */
  pageSizeMax: RuleType.number().min(1)
    .max(1000),
  /** 分页查询字段排序规则 */
  pageOrderBy: pageOrderByArraySchema,
  stringMax100: RuleType.string().trim()
    .min(1)
    .max(100),
  stringMax255: RuleType.string().trim()
    .min(1)
    .max(255),
  string: RuleType.string().trim(),
}

