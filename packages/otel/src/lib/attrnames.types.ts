
export enum AttrNames {
  HTTP_ERROR_NAME = 'http.error_name',
  HTTP_ERROR_MESSAGE = 'http.error_message',
  HTTP_ERROR_CAUSE = 'http.error_cause',
  HTTP_STATUS_TEXT = 'http.status_text',

  Exception_Cause = 'exception.cuase',
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

  RequestStartTime = 'request-start-time',
  RequestEndTime = 'request-end-time',

  DbName = 'db',
  DbClient = 'db.client',
  DbHost = 'db.host',
  DbDatabase = 'db.database',
  DbPort = 'db.port',
  DbUser = 'db.user',
  DbCommand = 'db.command',

  CallerClass = 'caller.class',
  CallerMethod = 'caller.method',

  ReqId = 'reqId',
  SvcIp4 = 'svc.ipv4',
  SvcIp6 = 'svc.ipv6',
  SvcException = 'svc.exception',
  SvcName = 'svc.name',
  SvcPid = 'svc.pid',
  SvcPpid = 'svc.ppid',
  SvcVer = 'svc.ver',
  SvcMemoryUsage = 'svc.memory-usage',
  SvcCpuUsage = 'svc.cpu-usage',

  Message = 'message',

  LogLevel = 'log.level',
  LogThrottleMs = 'log.throttle',
  IsTraced = '__isTraced',
  TopException = 'top-exception',

  Error = 'error',
  RequestBegin = 'tracer-request-begin',
  RequestEnd = 'tracer-request-end',
  PreProcessFinish = 'pre-process-finish',
  PostProcessBegin = 'post-process-begin',

  FetchStart = 'fetch-start',
  FetchFinish = 'fetch-finish',
  FetchException = 'fetch-exception',

  QueryResponse = 'query-response',
  QueryError = 'error',
  QueryStart = 'query-start',
  QueryFinish = 'query-finish',
  QueryRowCount = 'row-count',
  QueryCost = 'query-cost',
  QueryCostThottleInSec = 'query-cost-thottle-in-sec',
  QueryCostThottleInMS = 'query-cost-thottle-in-ms',

  ResponseMsg = 'response.msg',
  ErrMsg = 'err.msg',
  ErrStack = 'err.stack',

  ProcCpuinfo = 'proc.cpuinfo',
  ProcDiskstats = 'proc.diskstats',
  ProcMeminfo = 'proc.meminfo',
  ProcStat = 'proc.stat'
}
