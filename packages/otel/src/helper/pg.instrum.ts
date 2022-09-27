import { InstrumentationOption } from '@opentelemetry/instrumentation'
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg'


/**
 * @link https://www.npmjs.com/package/@opentelemetry/instrumentation-http
 */
export function regTraceInstrumPg(): InstrumentationOption {
  const ret = new PgInstrumentation()
  return ret
}

