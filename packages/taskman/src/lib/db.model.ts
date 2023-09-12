import { genDbDict } from 'kmore-types'

import { DbModel } from './db.model.dst.js'


export { DbModel }
export const dbDict = genDbDict<DbModel>()

