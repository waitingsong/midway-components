import { RuleType } from '@midwayjs/validate'


const pageOrderBySchema = RuleType.object().keys({
  column: RuleType.string().trim().min(1).max(50),
  order: RuleType.string().trim().valid('ASC', 'DESC', 'asc', 'desc'),
})
const pageOrderByArraySchema = RuleType.array().items(pageOrderBySchema)

export const commonValidSchemas = {
  // #region number

  number: RuleType.number(),
  int: RuleType.number().integer(),
  /** 自然数 */
  naturalNumber: RuleType.number().integer().min(0),

  /** https://joi.dev/api/?v=17.13.3#numberpositive */
  positive: RuleType.number().positive(),
  /** https://joi.dev/api/?v=17.13.3#numbernegative */
  negative: RuleType.number().negative(),

  /** 正整数 */
  positiveInt: RuleType.number().positive().integer(),
  /** 负整数 */
  negativeInt: RuleType.number().negative().integer(),


  // #region id

  id: RuleType.number().integer().min(1),

  bigintString: RuleType.string().trim().min(1).max(30).custom(bigintValidator, 'BigInt String Validator'),

  /** 雪花算法int结果字符串 */
  snowflakeString: RuleType.string().trim().min(1).max(19).custom(snowflakeIdValidator, 'Snowflake ID Validator'),

  /** 分页查询每页面最大记录数 */
  pageSizeMax: RuleType.number().integer().min(1).max(1000),
  /** 分页查询字段排序规则 */
  pageOrderBy: pageOrderByArraySchema,

  alphanum: RuleType.string().alphanum().trim(),
  name32: RuleType.string().alphanum().trim().min(1).max(32),
  name64: RuleType.string().alphanum().trim().min(1).max(64),

  // #region string

  string: RuleType.string().trim(),
  stringMax100: RuleType.string().trim().min(1).max(100),
  stringMax255: RuleType.string().trim().min(1).max(255),

  identifier: RuleType.string().min(1)
    .pattern(/^[A-Za-z][A-Za-z0-9_]*$/u)
    .message('Invalid format. Must start with a letter and can contain alphanumeric characters [a-zA-Z0-9_], underscores, and hyphens.'),


  /** https://joi.dev/api/?v=17.13.3#stringbase64options */
  base64: RuleType.string().trim().base64(),

  /** https://joi.dev/api/?v=17.13.3#stringhexoptions */
  hex: RuleType.string().trim().hex(),

  /** https://joi.dev/api/?v=17.13.3#stringdomainoptions */
  domain: RuleType.string().domain(),
  /** https://joi.dev/api/?v=17.13.3#stringhostname */
  hostname: RuleType.string().hostname(),
  /** https://joi.dev/api/?v=17.13.3#stringurioptions */
  uri: RuleType.string().uri(),

  /** https://joi.dev/api/?v=17.13.3#stringemailoptions */
  email128: RuleType.string().email().max(128),

  /** https://joi.dev/api/?v=17.13.3#stringdataurioptions */
  dataUri: RuleType.string().dataUri(),


  // #region ip

  /** https://joi.dev/api/?v=17.13.3#stringipoptions */
  ip: RuleType.string().ip(),


  // #region date

  dateString: RuleType.date(),
  /** https://joi.dev/api/?v=17.13.3#dateiso */
  iso: RuleType.date().iso(),
  /** https://joi.dev/api/?v=17.13.3#stringisodate */
  isoDate: RuleType.string().isoDate(),
  /** https://joi.dev/api/?v=17.13.3#stringisoduration */
  isoDuration: RuleType.string().isoDuration(),
  /** https://joi.dev/api/?v=17.13.3#datetimestamptype */
  timestamp: RuleType.date().timestamp(),


  // #region others

  /** https://joi.dev/api/?v=17.13.3#object */
  object: RuleType.object(),
  /** https://joi.dev/api/?v=17.13.3#symbol */
  symbol: RuleType.symbol(),
  boolean: RuleType.boolean(),
  array: RuleType.array(),
}

function bigintValidator(value: string, helpers: RuleType.CustomHelpers): string | RuleType.ErrorReport {
  // 检查字符串是否可以转换为 BigInt
  try {
    // BigInt 只能由整数构成
    if (/^\d+$/u.test(value)) {
      BigInt(value)
    }
    else {
      throw new Error('Invalid BigInt format')
    }
  }
  catch (ex) {
    return helpers.error('not a valid BigInt string')
  }
  return value
}

/** 自定义验证器，检查 ID 是否符合雪花算法的格式 */
function snowflakeIdValidator(value: string, helpers: RuleType.CustomHelpers): string | RuleType.ErrorReport {
  // 确保 ID 是一个字符串并且是数字
  if (typeof value !== 'string' || ! /^\d+$/u.test(value)) {
    return helpers.error('ID must be a string representing a numeric value')
  }

  const id = BigInt(value)

  // 定义有效的 ID 范围
  const minId = 0n // 最小有效 ID，通常是 0 或系统的起始值
  const maxId = 2n ** 63n - 1n // 最大有效 ID，BigInt 支持的范围

  // 验证 ID 是否在有效范围内
  if (id < minId || id > maxId) {
    return helpers.error('ID is out of valid range')
  }

  // 如果一切验证通过，返回值
  return value
}
