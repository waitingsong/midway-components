import { TextMapPropagator } from '@opentelemetry/api'
import { CompositePropagator, W3CTraceContextPropagator } from '@opentelemetry/core'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger'
import { Resource } from '@opentelemetry/resources'
import {
  SpanExporter,
  ConsoleSpanExporter,
  BatchSpanProcessor,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'

import { InitTraceOptions, PropagatorList, SpanExporterList } from '../lib/types'


interface InitTraceReturnType {
  provider: NodeTracerProvider
  processors: (BatchSpanProcessor | SimpleSpanProcessor)[]
}

export function initTrace(options: InitTraceOptions): InitTraceReturnType {
  const { otelConfig } = options
  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: otelConfig.serviceName,
    [SemanticResourceAttributes.SERVICE_VERSION]: otelConfig.serviceVersion,
  })
  const resourceFull = Resource.default().merge(resource)

  const provider = new NodeTracerProvider({
    resource: resourceFull,
  })
  // const flag = trace.setGlobalTracerProvider(provider)
  // assert(flag === true, 'setGlobalTracerProvider failed')
  provider.register()

  const processors: BatchSpanProcessor[] = []
  otelConfig.exporters.forEach((exporter) => {
    const processor = regExporterInstrum(options, provider, exporter)
    processors.push(processor)
  })
  regPropagators(otelConfig.propagators, provider)

  const ret = { provider, processors }
  return ret
}

function regPropagators(
  list: PropagatorList[],
  tracerProvider: NodeTracerProvider,
): void {

  const propagators: TextMapPropagator[] = []

  list.forEach((propagator) => {
    switch (propagator) {
      case PropagatorList.jaeger: {
        propagators.push(new JaegerPropagator())
        break
      }

      case PropagatorList.w3cTraceContext: {
        propagators.push(new W3CTraceContextPropagator())
        break
      }

      default: {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Propagator ${propagator} not implemented. Use registerInstrumentations() manually.`)
      }
    }
  })
  if (! propagators.length) { return }

  tracerProvider.register({
    propagator: new CompositePropagator({ propagators }),
  })
}


function regExporterInstrum(
  options: InitTraceOptions,
  provider: NodeTracerProvider,
  exporterName: SpanExporterList,
): BatchSpanProcessor {

  switch (exporterName) {
    case SpanExporterList.console: {
      const exporter: SpanExporter = new ConsoleSpanExporter()
      const processor = new BatchSpanProcessor(exporter)
      provider.addSpanProcessor(processor)
      return processor
    }

    // case SpanExporterList.jaeger: {
    //   const exporter: SpanExporter = new JaegerExporter(options.jaegerExporterConfig)
    //   const processor = new BatchSpanProcessor(exporter)
    //   provider.addSpanProcessor(processor)
    //   return processor
    // }

    case SpanExporterList.otlpGrpc: {
      const exporter: SpanExporter = new OTLPTraceExporter(options.otlpGrpcExporterConfig)
      const processor = new BatchSpanProcessor(exporter)
      provider.addSpanProcessor(processor)
      return processor
    }

    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new TypeError(`Exporter ${exporterName} not implemented`)

  }
}

