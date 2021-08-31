import { RuleType } from '@midwayjs/validate'


export const taskManValidSchemas = {
  json: RuleType.object(),
  date: RuleType.date(),
  timeoutIntv: RuleType.string().trim().min(2).max(50),
}

