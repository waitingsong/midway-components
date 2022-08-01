import { genDbDict } from 'kmore-types'

import { DbModel } from './db.model.dst'


export { DbModel }

// export * from './db.model.dst'
export const dbDict = genDbDict<DbModel>()

