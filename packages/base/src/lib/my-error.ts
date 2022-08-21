
/**
 * 全局自定义错误结构
 * 可以接受多条错误信息，用于业务抛错
 */
export class MyError extends Error {

  status: number
  details?: Error

  /**
   * 抛出异常，默认状态值 500
   */
  constructor(message: string, status = 500, cause?: Error) {
    if (cause) {
      super(message + ` &>${status}`, { cause })
      this.details = cause
    }
    else {
      super(message + ` &>${status}`) // 兼容ci测试时，assert无法自定义增加status
    }
    this.status = status
  }

}

