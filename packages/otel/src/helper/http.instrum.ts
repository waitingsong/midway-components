import { InstrumentationOption } from '@opentelemetry/instrumentation'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
// import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'


/**
 * @link https://www.npmjs.com/package/@opentelemetry/instrumentation-http
 */
export function regTraceInstrumHttp(): InstrumentationOption {
  const ret = new HttpInstrumentation()
  return ret
}

