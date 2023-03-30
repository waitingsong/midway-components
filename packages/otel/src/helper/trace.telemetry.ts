import { TextMapPropagator } from '@opentelemetry/api'
import { CompositePropagator, W3CTraceContextPropagator } from '@opentelemetry/core'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger'
import { node, resources } from '@opentelemetry/sdk-node'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'

import { InitTraceOptions, PropagatorList, SpanExporterList } from '../lib/types'

import { detectorResources } from './resource.detector'


interface InitTraceReturnType {
  provider: node.NodeTracerProvider
  processors: node.SpanProcessor[]
}

export function initTrace(options: InitTraceOptions): InitTraceReturnType {
  const { otelConfig } = options

  const resource = new resources.Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: otelConfig.serviceName,
    [SemanticResourceAttributes.SERVICE_VERSION]: otelConfig.serviceVersion,
  })
  const resourceDefault = resources.Resource.default()
  const resourceFull = resourceDefault.merge(resource).merge(detectorResources)

  const provider = new node.NodeTracerProvider({
    resource: resourceFull,
    spanLimits: {
      linkCountLimit: 127,
    },
  })

  const processors: node.SpanProcessor[] = []
  otelConfig.exporters.forEach((exporter) => {
    const processor = genExporterInstrum(options, exporter, options.isDevelopmentEnvironment)
    processors.push(processor)
    provider.addSpanProcessor(processor)
  })

  const propagators = genPropagators(otelConfig.propagators)
  provider.register({
    propagator: new CompositePropagator({ propagators }),
  })

  // const globalProvider = trace.getTracerProvider()
  // console.info({ globalProvider })
  // const spanProcessor = provider.activeSpanProcessor
  // const spanProcessor2 = provider.getActiveSpanProcessor()
  // void spanProcessor
  // void spanProcessor2

  const ret = { provider, processors }
  return ret
}

function genPropagators(
  list: PropagatorList[],
): TextMapPropagator[] {

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
  return propagators
}


function genExporterInstrum(
  options: InitTraceOptions,
  exporterName: SpanExporterList,
  isDevelopmentEnvironment: boolean,
): node.SpanProcessor {

  switch (exporterName) {
    case SpanExporterList.console: {
      const exporter: node.SpanExporter = new node.ConsoleSpanExporter()
      const processor = isDevelopmentEnvironment
        ? new node.SimpleSpanProcessor(exporter)
        : new node.BatchSpanProcessor(exporter)
      return processor
    }

    // case SpanExporterList.jaeger: {
    //   const exporter: SpanExporter = new JaegerExporter(options.jaegerExporterConfig)
    //   const processor = new BatchSpanProcessor(exporter)
    //   provider.addSpanProcessor(processor)
    //   return processor
    // }

    case SpanExporterList.otlpGrpc: {
      const exporter: node.SpanExporter = new OTLPTraceExporter(options.otlpGrpcExporterConfig)
      const processor = isDevelopmentEnvironment
        ? new node.SimpleSpanProcessor(exporter)
        : new node.BatchSpanProcessor(exporter)
      return processor
    }

    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new TypeError(`Exporter ${exporterName} not implemented`)

  }
}

