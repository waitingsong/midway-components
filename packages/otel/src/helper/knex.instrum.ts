import { InstrumentationOption } from '@opentelemetry/instrumentation'
import { KnexInstrumentation } from '@opentelemetry/instrumentation-knex'
// import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'


/**
 * @link https://www.npmjs.com/package/@opentelemetry/instrumentation-http
 */
export function regTraceInstrumKnex(): InstrumentationOption {
  const ret = new KnexInstrumentation()
  return ret
}

