import { ApiProperty } from '@midwayjs/swagger'
import { Rule } from '@midwayjs/validate'

import { commonValidSchemas } from './validation-schema/common.schema.js'


/** 查询排序规则 */
export class PageOrderByRule {
  @ApiProperty({ example: 'ctime', description: '排序字段' })
  column: string

  /**
   * @default ASC
   */
  @ApiProperty({ example: 'ASC', description: '排序顺序 默认升序' })
  order?: 'ASC' | 'DESC' | 'asc' | 'desc'
}


/**
 * 分页查询通用
 */
export class PagingDTO {
  /**
   * Current page number, start from 1
   */
  @ApiProperty({ example: 1, description: '指定页面 从1开始' })
  @Rule(commonValidSchemas.id.required())
  page: number

  @ApiProperty({ example: 100, description: '每页最多记录数' })
  @Rule(commonValidSchemas.pageSizeMax.required())
  pageSize: number

  @ApiProperty({
    type: PageOrderByRule,
    isArray: true,
    description: '字段排序规则数组',
  })
  @Rule(commonValidSchemas.pageOrderBy)
  orderBy?: PageOrderByRule[]
}

