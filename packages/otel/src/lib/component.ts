/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import assert from 'node:assert'
import { join } from 'node:path'

import {
  App,
  Autoload,
  Config as _Config,
  MidwayDecoratorService,
  Init,
  Inject,
  Logger,
  MidwayEnvironmentService,
  MidwayInformationService,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/core'
import { ILogger } from '@midwayjs/logger'
import {
  Application,
  AroundFactoryParamBase,
  RegisterDecoratorHandlerParam,
  registerDecoratorHandler,
} from '@mwcp/share'
import {
  Attributes,
  Context,
  Span,
  SpanKind,
  SpanOptions,
  context,
  trace,
  SpanStatusCode,
  SpanStatus,
  TimeInput,
} from '@opentelemetry/api'
import { node } from '@opentelemetry/sdk-node'
import { SemanticAttributes } from '@opentelemetry/semantic-conventions'
import { genISO8601String, humanMemoryUsage } from '@waiting/shared-core'
import type { NpmPkg } from '@waiting/shared-types'

import { AbstractOtelComponent } from './abstract'
import { initSpanStatusOptions } from './config'
import { KEY_Trace } from './decorator.trace/trace'
import {
  decoratorExecutorAsync as decoratorExecutorTraceAsync,
  decoratorExecutorSync as decoratorExecutorTraceSync,
} from './decorator.trace/trace.helper'
import { METHOD_KEY_TraceInit } from './decorator.trace-init/trace-init'
import { decoratorExecutor as decoratorExecutorTraceInit } from './decorator.trace-init/trace-init.helper'
import { TraceDecoratorOptions } from './decorator.types'
import { genDecoratorExecutorOptions } from './trace.helper'
import {
  AddEventOtpions,
  AttrNames,
  Config,
  ConfigKey,
  InitTraceOptions,
  SpanStatusOptions,
} from './types'
import { normalizeHeaderKey, setSpan } from './util'

// eslint-disable-next-line import/max-dependencies
import { initTrace } from '~/helper/index.opentelemetry'


/** OpenTelemetry Component */
@Autoload()
@Provide()
@Scope(ScopeEnum.Singleton)
export class OtelComponent extends AbstractOtelComponent {

  @App() app: Application

  @_Config(ConfigKey.config) protected readonly config: Config

  // @_Config(ConfigKey.jaegerExporterConfig)
  // protected readonly jaegerExporterConfig: InitTraceOptions['jaegerExporterConfig']

  @_Config(ConfigKey.otlpGrpcExporterConfig)
  protected readonly otlpGrpcExporterConfig: InitTraceOptions['otlpGrpcExporterConfig']

  @Inject() protected readonly decoratorService: MidwayDecoratorService
  @Inject() protected readonly environmentService: MidwayEnvironmentService

  @Logger() protected readonly logger: ILogger

  /** Active during Midway Lifecyle between onReady and onServerReady */
  appInitProcessContext: Context | undefined
  /** Active during Midway Lifecyle between onReady and onServerReady */
  appInitProcessSpan: Span | undefined

  otelLibraryName: string
  otelLibraryVersion: string
  /* request|response -> Map<lower,norm> */
  readonly captureHeadersMap = new Map<string, Map<string, string>>()

  protected traceProvider: node.NodeTracerProvider | undefined
  protected spanProcessors: node.SpanProcessor[] = []

  instId = Symbol(Date.now())

  // constructor(options?: { name: string, version: string }) {
  //   super()
  //   if (options?.name) {
  //     const { name, version } = options
  //     this.otelLibraryName = name
  //     this.otelLibraryVersion = version ?? ''
  //   }
  // }

  @Init()
  async init(): Promise<void> {

    const key = `_${ConfigKey.componentName}`
    // @ts-ignore
    if (typeof this.app[key] === 'undefined') {
      // @ts-ignore
      this.app[key] = this
    }
    // @ts-ignore
    else if (this.app[key] !== this) {
      // @ts-ignore
      const id = (this.app[key] as OtelComponent).instId.toString()
      const currentId = this.instId.toString()
      throw new Error(`this.app.${key} not equal to otel, id: ${id}, currentId: ${currentId}.
      Check if you have multiple otel instances in your project.`)
    }

    await this._init()

    const isDevelopmentEnvironment = this.environmentService.isDevelopmentEnvironment()
      && ! process.env['CI_BENCHMARK']

    const { processors, provider } = initTrace({
      otelConfig: this.config,
      // jaegerExporterConfig: this.jaegerExporterConfig,
      otlpGrpcExporterConfig: this.otlpGrpcExporterConfig,
      isDevelopmentEnvironment,
    })
    this.traceProvider = provider
    this.spanProcessors = processors

    const opts: SpanOptions = {
      root: true,
      kind: SpanKind.INTERNAL,
    }
    const spanName = 'APP INIT'
    const traceCtx = this.getGlobalCurrentContext()

    // this.appInitProcessSpan = this.startSpan(spanName, opts)
    this.startActiveSpan(spanName, (
      span,
    ) => {
      this.appInitProcessSpan = span
      const ctxWithSpanSet = setSpan(traceCtx, span)
      this.appInitProcessContext = ctxWithSpanSet
    }, opts)

    // const span = this.getGlobalCurrentSpan(this.appInitProcessContext)
    // void traceCtx
    // void span

    this.prepareCaptureHeaders('request', this.config.captureRequestHeaders)
    this.prepareCaptureHeaders('response', this.config.captureRequestHeaders)

    this.addAppInitEvent({
      event: `${ConfigKey.componentName}.init.end`,
    })

  }

  getGlobalCurrentContext(): Context {
    const traceContext = context.active()
    return traceContext
  }

  getGlobalCurrentSpan(traceContext?: Context): Span | undefined {
    if (! this.config.enable) { return }
    return trace.getSpan(traceContext ?? context.active())
  }

  getTraceId(): string | undefined {
    if (! this.config.enable) { return }
    return this.getGlobalCurrentSpan()?.spanContext().traceId
  }

  /**
   * Starts a new {@link Span}. Start the span without setting it on context.
   * This method do NOT modify the current Context.
   */
  startSpan(name: string, options?: SpanOptions, traceContext?: Context): Span {
    const { span } = this.startSpan2(name, options, traceContext)
    return span
  }

  /**
   * Starts a new {@link Span}. Start the span without setting it on context.
   */
  startSpan2(name: string, options?: SpanOptions, traceContext?: Context): { span: Span, context: Context } {
    const tracer = trace.getTracer(this.otelLibraryName, this.otelLibraryVersion)
    const opts: SpanOptions = {
      kind: SpanKind.CLIENT,
      ...options,
    }
    const span = tracer.startSpan(name, opts, traceContext)
    const ctx = setSpan(traceContext ?? context.active(), span)
    return { span, context: ctx }
  }

  /**
   * Starts a new {@link Span} and calls the given function passing it the created span as first argument.
   * Additionally the new span gets set in context and this context is activated
   * for the duration of the function call.
   */
  startActiveSpan<F extends (
    ...args: [Span]
  ) => ReturnType<F>>(
    name: string,
    callback: F,
    options?: SpanOptions,
    traceContext?: Context,
  ): ReturnType<F> {

    assert(name, 'name must be set')

    const tracer = trace.getTracer(this.otelLibraryName, this.otelLibraryVersion)
    const opts: SpanOptions = {
      kind: SpanKind.CLIENT,
      // startTime: Date.now(),
      ...options,
    }
    const ret = traceContext
      ? tracer.startActiveSpan(name, opts, traceContext, callback)
      : tracer.startActiveSpan(name, opts, callback)
    return ret
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
    // await this.traceProvider?.shutdown()
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
    if (! this.config.enable) { return }
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


  /**
   * Sets the attributes to the given span.
   */
  setAttributes(span: Span, input: Attributes): void {
    if (! this.config.enable) { return }
    span.setAttributes(input)
  }


  /**
   * Sets the span with the error passed in params, note span not ended.
   */
  setSpanWithError(
    rootSpan: Span,
    span: Span,
    error: Error | undefined,
    eventName?: string,
  ): void {

    if (! this.config.enable) { return }

    const time = genISO8601String()
    const attrs: Attributes = {
      time,
    }
    if (eventName) {
      attrs['event'] = eventName
    }

    if (error) {
      attrs[AttrNames.HTTP_ERROR_NAME] = error.name
      attrs[AttrNames.HTTP_ERROR_MESSAGE] = error.message
      span.setAttributes(attrs)

      this.addRootSpanEventWithError(span, error)

      // @ts-ignore
      if (error.cause instanceof Error || error[AttrNames.IsTraced]) {
        if (span !== rootSpan) {
          // error contains cause, then add events only
          attrs[SemanticAttributes.EXCEPTION_MESSAGE] = 'skipping'
          this.addEvent(span, attrs)
        }
      }
      else { // if error contains no cause, add error stack to span
        span.recordException(error)
      }

      Object.defineProperty(error, AttrNames.IsTraced, {
        value: true,
      })
    }

    span.setStatus({ code: SpanStatusCode.ERROR, message: error?.message ?? 'unknown error' })
  }

  /**
   * - ends the given span
   * - set span with error if error passed in params
   * - set span status
   * - call span.end(), except span is root span
   */
  endSpan(
    rootSpan: Span,
    span: Span,
    spanStatusOptions: SpanStatusOptions = initSpanStatusOptions,
    endTime?: TimeInput,
  ): void {

    if (! this.config.enable) { return }

    const opts: SpanStatusOptions = {
      ...initSpanStatusOptions,
      ...spanStatusOptions,
    }
    const { code } = opts
    if (code === SpanStatusCode.ERROR) {
      this.setSpanWithError(rootSpan, span, spanStatusOptions.error)
    }
    else { // OK, UNSET
      const status: SpanStatus = {
        code,
      }
      if (opts.message) {
        status.message = opts.message
      }
      span.setStatus(status)
    }

    if (span !== rootSpan) {
      span.end(endTime)
    }
  }

  endRootSpan(
    rootSpan: Span,
    spanStatusOptions: SpanStatusOptions = initSpanStatusOptions,
    endTime?: TimeInput,
  ): void {

    if (! this.config.enable) { return }
    this.endSpan(rootSpan, rootSpan, spanStatusOptions, endTime)
    rootSpan.end(endTime)
  }

  addAppInitEvent(
    input: Attributes,
    options?: AddEventOtpions,
    /** if omit, use this.appInitProcessSpan */
    span?: Span,
  ): void {

    const spanToUse = span ?? this.appInitProcessSpan

    if (spanToUse) {
      const addEventOtpions = {
        traceEvent: true,
        logCpuUsage: true,
        logMemeoryUsage: true,
        ...options,
      }
      this.addEvent(spanToUse, input, addEventOtpions)
    }
  }

  endAppInitEvent(): void {
    if (this.appInitProcessSpan) {
      this.endRootSpan(this.appInitProcessSpan)
      this.appInitProcessContext = void 0
      this.appInitProcessSpan = void 0
    }
  }



  protected prepareCaptureHeaders(type: 'request' | 'response', headersKey: string[]) {
    const keys = normalizeHeaderKey(headersKey)
    this.captureHeadersMap.set(type, keys)
  }

  protected async _init(): Promise<void> {
    assert(
      this.app,
      'this.app undefined. If start for development, please set env first like `export MIDWAY_SERVER_ENV=local`',
    )

    let pkg: NpmPkg | undefined
    const informationService = await this.app.getApplicationContext().getAsync(MidwayInformationService)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (informationService) {
      pkg = informationService.getPkg() as NpmPkg
    }
    let serviceName = this.config.serviceName
      ? this.config.serviceName
      : pkg?.name ?? `unknown-${new Date().toLocaleDateString()}`
    serviceName = serviceName.replace('@', '').replace(/\//ug, '-')

    const ver = this.config.serviceVersion
      ? this.config.serviceVersion
      : pkg?.version ?? ''

    // for registerDecoratorHandler
    this.config.serviceName = serviceName
    this.config.serviceVersion = ver


    if (! this.otelLibraryName) {
      const otelPkgPath = join(__dirname, '../../package.json')
      try {
        const { name, version } = await import(otelPkgPath) as NpmPkg
        if (name) {
          this.otelLibraryName = name
        }
        if (version) {
          this.otelLibraryVersion = version
        }
      }
      catch (ex) {
        this.logger.warn('Failed to load package.json: %s', otelPkgPath)
      }
    }

    const aroundFactoryOptions: AroundFactoryParamBase = {
      config: this.config,
      webApp: this.app,
    }

    const TraceOpts: RegisterDecoratorHandlerParam<TraceDecoratorOptions> = {
      decoratorKey: KEY_Trace,
      decoratorService: this.decoratorService,
      fnDecoratorExecutorAsync: decoratorExecutorTraceAsync,
      fnDecoratorExecutorSync: decoratorExecutorTraceSync,
      fnGenDecoratorExecutorParam: genDecoratorExecutorOptions,
    }
    registerDecoratorHandler(TraceOpts, aroundFactoryOptions)

    const TraceInitOpts: RegisterDecoratorHandlerParam<TraceDecoratorOptions> = {
      decoratorKey: METHOD_KEY_TraceInit,
      decoratorService: this.decoratorService,
      fnDecoratorExecutorAsync: decoratorExecutorTraceInit,
      fnDecoratorExecutorSync: false,
      fnGenDecoratorExecutorParam: genDecoratorExecutorOptions,
    }
    registerDecoratorHandler(TraceInitOpts, aroundFactoryOptions)

  }

}

