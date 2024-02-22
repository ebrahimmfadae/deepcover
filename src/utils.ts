export function cachedGenerator<T extends Generator>(generator: T) {
  const cache: any[] = []
  return function* () {
    let currentIndex = 0
    while (true) {
      if (currentIndex >= cache.length) {
        const { value, done } = generator.next()
        if (done) return value
        cache.push(value)
      }
      yield cache[currentIndex++]
    }
  } as () => T
}

export function escapeArray<T>(object: T) {
  // TODO: Implement
  return object
}

export function isPOJO(obj: unknown): obj is object {
  if (obj === null || typeof obj !== "object") return false
  const prototype = Object.getPrototypeOf(obj)
  return prototype === Object.prototype || prototype === null
}

export function typeSafeIsArray<T>(arr: T | T[]): arr is T[] {
  return Array.isArray(arr)
}
