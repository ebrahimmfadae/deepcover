import { permute } from "./permutation"
import {
  append,
  appendInfinite,
  counter,
  enums,
  max,
  object,
  optional,
} from "./permutationGenerators"

const CONSIDERED_INFINITY = 10_000_000

describe(`Permutation Generator`, () => {
  it(`should generate numbers up to ${CONSIDERED_INFINITY}`, () => {
    let m = 0
    for (const v of max(counter(1), CONSIDERED_INFINITY)()) {
      m = v
    }
    expect(m).toBe(CONSIDERED_INFINITY)
  })
  it(`should generate objects with number field up to ${CONSIDERED_INFINITY}`, () => {
    let m
    for (const v of max(
      object({ number: counter(1) }),
      CONSIDERED_INFINITY,
    )()) {
      m = v
    }
    expect(m).toStrictEqual({ number: CONSIDERED_INFINITY })
  })
  it(`should generate objects with nested object`, () => {
    for (const v of max(
      object({ numberContainer: object({ number: counter(1) }) }),
      15,
    )()) {
      // console.log(v)
    }
  })
  it(`should generate objects with two fields`, () => {
    for (const v of max(
      object({ number1: max(counter(1), 13), number2: max(counter(300), 12) }),
      50,
    )()) {
      // console.log(v)
    }
  })
  it(`should generate objects with calculated field`, () => {
    for (const v of append(
      object({ number1: max(counter(1), 13), number2: max(counter(300), 12) }),
      (permutation) => {
        return object({ number3: enums(["a", "b", permutation.number1]) })
      },
    )()) {
      // console.log(v)
    }
  })
  it(`should generate objects with infinite appended field`, () => {
    for (const v of appendInfinite(
      object({ number1: max(counter(1), 13), number2: max(counter(300), 12) }),
      object({ number4: counter() }),
    )()) {
      // console.log(v)
    }
  })
})
