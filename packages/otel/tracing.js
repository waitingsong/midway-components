const process = require('process')

const opentelemetry = require('@opentelemetry/sdk-node')
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions')


const { name, version } = require('./package.json')
// normilize service name for ali SLS
const serviceName = name ? name.replace(/@/g, '').replace(/\//g, '-') : 'my-service'

const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
  [SemanticResourceAttributes.SERVICE_VERSION]: version,
})

// 初始化一个 open-telemetry 的 SDK
const sdk = new opentelemetry.NodeSDK({
  resource,
})


// 初始化 SDK，成功启动之后，再启动 Midway 框架
sdk.start()
  .then(() => {
    console.log('sdk ok')
    // return Bootstrap.configure().run()
  })

// 在进程关闭时，同时关闭数据采集
process.on('SIGTERM', () => {
  shutdown()
})

process.on('exit', () => {
  shutdown()
})

function shutdown() {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
}

