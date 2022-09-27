import { InstrumentationOption } from '@opentelemetry/instrumentation'
import { DnsInstrumentation } from '@opentelemetry/instrumentation-dns'


/**
 * @link https://www.npmjs.com/package/@opentelemetry/instrumentation-dns
 */
export function regTraceInstrumDns(): InstrumentationOption {
  const ret = new DnsInstrumentation()
  return ret
}

