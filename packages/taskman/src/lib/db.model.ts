import { genDbDict } from 'kmore-types'

import { DbModel } from './db.model.dst'


export { DbModel }

export const dbDict = genDbDict<DbModel>()
// XXexport * from './db.model.dst'

