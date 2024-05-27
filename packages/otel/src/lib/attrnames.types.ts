
export enum AttrNames {
  HTTP_ERROR_NAME = 'http.error_name',
  HTTP_ERROR_MESSAGE = 'http.error_message',
  HTTP_ERROR_CAUSE = 'http.error_cause',
  HTTP_STATUS_TEXT = 'http.status_text',

  ServiceName = 'service.name',
  ServiceVersion = 'service.version',

  Incoming_Request_data = 'incoming.request.data',
  Outgoing_Request_data = 'outgoing.request.data',
  Incoming_Response_data = 'incoming.response.data',
  Outgoing_Response_data = 'outgoing.response.data',

  Http_Response_Code = 'http.response.code',
  Http_Request_Body = 'http.request.body',
  Http_Request_Query = 'http.request.query',
  Http_Response_Body = 'http.response.body',

  CallerClass = 'caller.class',
  CallerMethod = 'caller.method',

  reqId = 'reqId',
  traceId = 'traceId',
  ServicePid = 'service.pid',
  ServicePpid = 'service.ppid',
  ServiceMemoryUsage = 'service.memory.usage',
  ServiceCpuUsage = 'service.cpu.usage',

  LogLevel = 'log.level',
  LogThrottleMs = 'log.throttle',
  IsTraced = '__isTraced__',
  TopException = 'top-exception',

  Error = 'error',
  Message = 'message',
  Exception = 'exception',
  Exception_Cause = 'exception.cause',
  Exception_Type = 'exception.type',

  RequestStartTime = 'request.start.time',
  RequestEndTime = 'request.end.time',
  RequestBegin = 'request.begin',
  RequestEnd = 'request.end',
  PreProcessFinish = 'pre.process.finish',
  PostProcessBegin = 'post.process.begin',

  FetchStart = 'fetch.start',
  FetchFinish = 'fetch.finish',
  FetchException = 'fetch.exception',

  QueryResponse = 'query.response',
  QueryError = 'query.error',
  QueryStart = 'query.start',
  QueryFinish = 'query.finish',
  QueryRowCount = 'row.count',
  QueryCost = 'query.cost',
  /**
   * @deprecated use QueryCostThrottleInSec instead
   */
  QueryCostThottleInSec = 'query.cost.thottle.in.sec',
  QueryCostThrottleInSec = 'query.cost.throttle.in.sec',
  /**
   * @deprecated use QueryCostThrottleInMS instead
   */
  QueryCostThottleInMS = 'query.cost.thottle.in.ms',
  QueryCostThrottleInMS = 'query.cost.throttle.in.ms',
  TransactionStart = 'transaction.start',
  TransactionCommit = 'transaction.commit',
  TransactionRollback = 'transaction.rollback',

  TransactionalRegister = 'Transactional.register',
  TransactionalStart = 'Transactional.start',
  TransactionalEnd = 'Transactional.end',
  /** top, child, save-point */
  TransactionalEntryType = 'Transactional.entry',

  TrxPropagated = 'trx.propagated',
  TrxPropagationType = 'trx.propagation.type',
  TrxPropagationClass = 'trx.propagation.class',
  TrxPropagationIsolationLevel = 'trx.propagation.isolation.level',
  TrxPropagationFunc = 'trx.propagation.func',
  TrxPropagationMethod = 'trx.propagation.method',
  TrxPropagationPath = 'trx.propagation.path',
  /** Setting value */
  TrxPropagationReadRowLockLevel = 'trx.propagation.read.rowlock.level',
  /** Setting value */
  TrxPropagationWriteRowLockLevel = 'trx.propagation.write.rowlock.level',
  /** Runtime level on builder */
  TrxPropagationRowLockLevel = 'trx.propagation.rowlock.level',

  ResponseMsg = 'response.msg',
  // ErrMsg = 'err.msg',
  // ErrStack = 'err.stack',

  ProcCpuinfo = 'proc.cpuinfo',
  ProcDiskstats = 'proc.diskstats',
  ProcMeminfo = 'proc.meminfo',
  ProcStat = 'proc.stat',
}
