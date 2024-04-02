
interface ProcessExOptions {
  cacheKey: string | false
  error: unknown
}

export function processEx(options: ProcessExOptions): Promise<never> {
  const { cacheKey, error } = options

  console.error('cache error', error)
  const ex2Msg = error instanceof Error
    ? error.message
    : typeof error === 'string' ? error : JSON.stringify(error)

  const ex3 = new Error(`[@mwcp/cache] cache error with key: "${cacheKey}" >
  message: ${ex2Msg}`, { cause: error })
  return Promise.reject(ex3)
}

