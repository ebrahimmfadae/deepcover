import { isPOJO } from "./utils"

export type CompareResult<T> = {
  key: T
  state: `unchanged` | `changed` | `created` | `deleted`
  value: unknown
  changedTo?: unknown
}

function isNotExpandable(obj: any) {
  return !Array.isArray(obj) && !isPOJO(obj)
}

export function compare<
  T extends Record<string, any>,
  E extends Record<string, any>,
>(a: T, b: E, prefix?: string) {
  const initial: CompareResult<string>[] = []

  const keys = Array.from(new Set(Object.keys(a).concat(Object.keys(b))))

  return keys.reduce((acc, key) => {
    const fullKey = prefix ? [prefix, key].join(`.`) : key
    const valueA = a[key]
    const valueB = b[key]
    if (
      (isPOJO(valueA) && isPOJO(valueB)) ||
      (Array.isArray(valueA) && Array.isArray(valueB))
    ) {
      acc.push(...compare(valueA, valueB, fullKey))
    } else if (
      typeof valueA !== typeof valueB ||
      isNotExpandable(valueA) ||
      isNotExpandable(valueB)
    ) {
      if (key in a && !(key in b)) {
        acc.push({
          key: fullKey,
          state: `deleted`,
          value: valueA,
        })
      } else if (!(key in a) && key in b) {
        acc.push({
          key: fullKey,
          state: `created`,
          value: valueB,
        })
      } else if (valueA !== valueB) {
        acc.push({
          key: fullKey,
          state: `changed`,
          value: valueA,
          changedTo: valueB,
        })
      } else {
        acc.push({
          key: fullKey,
          state: `unchanged`,
          value: valueA,
        })
      }
    } else {
      throw Error("Illegal state")
    }
    return acc
  }, initial)
}
