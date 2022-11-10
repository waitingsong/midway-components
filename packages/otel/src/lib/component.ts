/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import assert from 'node:assert'

import {
  Config as _Config,
  Init,
  Logger,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/decorator'
import { ILogger } from '@midwayjs/logger'
import {
  Attributes,
  Context,
  Span,
  SpanKind,
  SpanOptions,
  context,
  trace,
} from '@opentelemetry/api'
import type {
  BasicTracerProvider,
  BatchSpanProcessor,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-node'
import { SemanticAttributes } from '@opentelemetry/semantic-conventions'
import { humanMemoryUsage } from '@waiting/shared-core'

import { AddEventOtpions, AttrNames, Config, ConfigKey, InitTraceOptions } from './types'
import { normalizeHeaderKey } from './util'

import { initTrace } from '~/helper/index.opentelemetry'


/** OpenTelemetry Component */
@Provide()
@Scope(ScopeEnum.Singleton)
export class OtelComponent {

  @_Config(ConfigKey.config) protected readonly config: Config

  // @_Config(ConfigKey.jaegerExporterConfig)
  // protected readonly jaegerExporterConfig: InitTraceOptions['jaegerExporterConfig']

  @_Config(ConfigKey.otlpGrpcExporterConfig)
  protected readonly otlpGrpcExporterConfig: InitTraceOptions['otlpGrpcExporterConfig']

  @Logger() protected readonly logger: ILogger

  otelLibraryName: string
  otelLibraryVersion: string
  /* request|response -> Map<lower,norm> */
  readonly captureHeadersMap = new Map<string, Map<string, string>>()

  protected traceProvider: BasicTracerProvider | undefined
  protected spanProcessors: (BatchSpanProcessor | SimpleSpanProcessor)[] = []

  @Init()
  async init(): Promise<void> {
    const { processors, provider } = initTrace({
      otelConfig: this.config,
      // jaegerExporterConfig: this.jaegerExporterConfig,
      otlpGrpcExporterConfig: this.otlpGrpcExporterConfig,
    })
    this.traceProvider = provider
    this.spanProcessors = processors

    this.prepareCaptureHeaders('request', this.config.captureRequestHeaders)
    this.prepareCaptureHeaders('response', this.config.captureRequestHeaders)
  }

  getGlobalCurrentContext(): Context {
    const traceContext = context.active()
    return traceContext
  }

  getGlobalCurrentSpan(traceContext?: Context): Span | undefined {
    return trace.getSpan(traceContext ?? context.active())
  }

  getTraceId(): string | undefined {
    return this.getGlobalCurrentSpan()?.spanContext().traceId
  }

  /**
   * Starts a new {@link Span}. Start the span without setting it on context.
   * This method do NOT modify the current Context.
   */
  startSpan(name: string, options?: SpanOptions, traceContext?: Context): Span {
    const tracer = trace.getTracer(this.otelLibraryName, this.otelLibraryVersion)
    const opts: SpanOptions = {
      kind: SpanKind.CLIENT,
      ...options,
    }
    const span = tracer.startSpan(name, opts, traceContext)
    return span
  }

  /**
   * Starts a new {@link Span} and calls the given function passing it the created span as first argument.
   * Additionally the new span gets set in context and this context is activated
   * for the duration of the function call.
   */
  startActiveSpan<F extends (
    ...args: [Span]) => ReturnType<F>>(
    name: string,
    callback: F,
    options?: SpanOptions,
    traceContext?: Context,
  ): ReturnType<F> {

    assert(name, 'name must be set')

    const tracer = trace.getTracer(this.otelLibraryName, this.otelLibraryVersion)
    const opts: SpanOptions = {
      kind: SpanKind.CLIENT,
      ...options,
    }
    return traceContext
      ? tracer.startActiveSpan(name, opts, traceContext, callback)
      : tracer.startActiveSpan(name, opts, callback)
  }

  async flush(): Promise<void> {
    const pms: Promise<void>[] = []
    this.spanProcessors.forEach(proc => pms.push(proc.forceFlush()))
    await Promise.allSettled(pms)
    await this.traceProvider?.forceFlush()
  }

  async shutdown(): Promise<void> {
    try {
      const currSpan = this.getGlobalCurrentSpan()
      if (currSpan) {
        currSpan.end()
      }
    }
    catch (ex) {
      this.logger.warn(ex)
    }
    await this.flush()
    await this.traceProvider?.shutdown()
  }


  /**
   * Adds an event to the given span.
   */
  addEvent(
    span: Span,
    input: Attributes,
    options?: AddEventOtpions,
  ): void {

    if (! this.config.enable) { return }
    if (options?.traceEvent === false || this.config.traceEvent === false) { return }

    const ename = typeof input['event'] === 'string' || typeof input['event'] === 'number'
      ? String(input['event']) : ''
    const name = options?.eventName ?? ename
    delete input['event']

    if (options?.logMemeoryUsage || this.config.logMemeoryUsage) {
      input[AttrNames.ServiceMemoryUsage] = JSON.stringify(humanMemoryUsage(), null, 2)
    }
    if (options?.logCpuUsage || this.config.logCpuUsage) {
      input[AttrNames.ServiceCpuUsage] = JSON.stringify(process.cpuUsage(), null, 2)
    }

    span.addEvent(name, input, options?.startTime)
  }

  addRootSpanEventWithError(span: Span, error?: Error): void {
    if (! error) { return }

    const { cause } = error
    // @ts-ignore
    if (cause instanceof Error || error[AttrNames.IsTraced]) {
      return // avoid duplicated logs for the same error on the root span
    }

    const { name, message, stack } = error
    const attrs: Attributes = {
      [SemanticAttributes.EXCEPTION_TYPE]: 'exception',
      [SemanticAttributes.EXCEPTION_MESSAGE]: message,
    }
    stack && (attrs[SemanticAttributes.EXCEPTION_STACKTRACE] = stack)
    this.addEvent(span, attrs, {
      eventName: `${name}-Cause`,
    }) // Error-Cause
  }

  protected prepareCaptureHeaders(type: 'request' | 'response', headersKey: string[]) {
    const keys = normalizeHeaderKey(headersKey)
    this.captureHeadersMap.set(type, keys)
  }


}


