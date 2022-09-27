const process = require('process')

// process.env.MIDWAY_SERVER_ENV = 'unittest'
// process.env['NODE_ENV'] = 'unittest'

// const { trace } = require('@opentelemetry/api')
// const tracer = trace.getTracer("my-application", "0.1.0")
// console.log({ tracer })

const opentelemetry = require('@opentelemetry/sdk-node')
const { ConsoleSpanExporter, } = require('@opentelemetry/sdk-trace-base')
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node')
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions')
const { KoaInstrumentation } = require('@opentelemetry/instrumentation-koa');

const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');

const { JaegerExporter } = require('@opentelemetry/exporter-jaeger')
const { JaegerPropagator } = require('@opentelemetry/propagator-jaeger')

//

const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');



const { Bootstrap } = require('@midwayjs/bootstrap')

// https://www.npmjs.com/package/@opentelemetry/exporter-jaeger
const tracerAgentHost = process.env['TRACER_AGENT_HOST'] || '192.168.1.248'
const jaegerExporter = new JaegerExporter({
  host: tracerAgentHost,
});

// 初始化一个 open-telemetry 的 SDK
const sdk = new opentelemetry.NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'my-service',
  }),
  // 配置当前的导出方式，比如这里配置了一个输出到控制台的，也可以配置其他的 Exporter，比如 Jaeger
  // traceExporter: new ConsoleSpanExporter(),
  traceExporter: jaegerExporter,
  // textMapPropagator: new JaegerPropagator(),

  // 这里配置了默认自带的一些监控模块，比如 http 模块等
  //instrumentations: [getNodeAutoInstrumentations()]
});


//

// 初始化 SDK，成功启动之后，再启动 Midway 框架
sdk.start()
  .then(() => {
    return Bootstrap.configure().run()
  })

// 在进程关闭时，同时关闭数据采集
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
})


