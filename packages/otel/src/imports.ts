import * as grpc from '@midwayjs/grpc'
import * as info from '@midwayjs/info'
import * as koa from '@midwayjs/koa'
import * as swagger from '@midwayjs/swagger'
import * as share from '@mwcp/share'


/* c8 ignore next 4 */
const CI = !! (process.env['MIDWAY_SERVER_ENV'] === 'unittest'
  || process.env['MIDWAY_SERVER_ENV'] === 'local'
  || process.env['NODE_ENV'] === 'unittest'
  || process.env['NODE_ENV'] === 'local'
)

export const useComponents: IComponentInfo[] = []
if (CI) {
  useComponents.push(koa)
  useComponents.push(info)
  useComponents.push(swagger)
  useComponents.push(grpc)
}

useComponents.push(share)


export interface IComponentInfo {
  Configuration: unknown
  [key: string]: unknown
}

