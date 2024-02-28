import { permute } from "./permutation"
import { enums, object, one, optional, tuple } from "./permutationGenerators"

describe("Test permutation", () => {
  it("should generate permutations for an empty object", () => {
    const permuted = permute({})
    expect(permuted).toStrictEqual([{}])
  })
  it("should generate permutations for a one fielded object", () => {
    const permuted = permute({
      name: enums(["bruce", "alfred"]),
    })
    expect(permuted).toStrictEqual([{ name: "bruce" }, { name: "alfred" }])
  })
  it("should generate permutations for a two fielded object", () => {
    const permuted = permute({
      name: enums(["bruce", "alfred"]),
      quantity: enums([5, 6]),
    })
    expect(permuted).toStrictEqual([
      { name: "bruce", quantity: 5 },
      { name: "bruce", quantity: 6 },
      { name: "alfred", quantity: 5 },
      { name: "alfred", quantity: 6 },
    ])
  })
  it("should generate permutations for a two fielded object with one non array field", () => {
    const permuted = permute({
      name: enums(["bruce", "alfred"]),
      quantity: one(5),
    })
    expect(permuted).toStrictEqual([
      { name: "bruce", quantity: 5 },
      { name: "alfred", quantity: 5 },
    ])
  })
  it("should generate permutations for a two fielded object with one NON_EXIST value", () => {
    const permuted = permute({
      name: optional(enums(["bruce", "alfred"])),
      quantity: enums([5]),
    })
    expect(permuted).toStrictEqual([
      { name: "bruce", quantity: 5 },
      { name: "alfred", quantity: 5 },
      { quantity: 5 },
    ])
  })
  it("should generate permutations for a large object", () => {
    const l = 5
    const keyPairs = Array.from(
      new Array(9),
      (_, i) => [i, enums(Array.from(new Array(l), (_, j) => j))] as const,
    )
    const permutationsCount = keyPairs.reduce((acc, curr) => acc * l, 1)
    const input = Object.fromEntries(keyPairs)
    const permuted = permute(input)
    expect(permuted.length).toBe(permutationsCount)
  })
  it("should generate permutations for a tuple", () => {
    const permuted = Array.from(
      tuple([
        object({ a: enums(["a1", "a2"]) }),
        object({ b: enums(["b1", "b2"]) }),
      ])(),
    )
    expect(permuted).toStrictEqual([
      [{ a: "a1" }, { b: "b1" }],
      [{ a: "a1" }, { b: "b2" }],
      [{ a: "a2" }, { b: "b1" }],
      [{ a: "a2" }, { b: "b2" }],
    ])
  })
  it("should generate permutations for a nested object", () => {
    const permuted = permute({
      name: tuple([
        object({ a: enums(["a1", "a2"]) }),
        object({ b: enums(["b1", "b2"]) }),
      ]),
    })
    expect(permuted).toStrictEqual([
      { name: [{ a: "a1" }, { b: "b1" }] },
      { name: [{ a: "a1" }, { b: "b2" }] },
      { name: [{ a: "a2" }, { b: "b1" }] },
      { name: [{ a: "a2" }, { b: "b2" }] },
    ])
  })
  it("should generate permutations for a complex array object", () => {
    const a = {
      a: enums(["a1", "a2"]),
      b: enums(["b1"]),
    }
    const b = object(a)
    const c = tuple([b])
    const permuted = Array.from(c())
    expect(permuted).toStrictEqual([
      [{ b: "b1", a: "a1" }],
      [{ b: "b1", a: "a2" }],
    ])
  })
  it("should generate permutations for a complex first key nested object", () => {
    const permuted = permute({
      a: tuple([
        object({
          a1: enums(["a11", "a12"]),
          a2: enums(["a21"]),
        }),
      ]),
      b: enums(["b1"]),
    })
    expect(permuted).toStrictEqual([
      {
        a: [{ a2: "a21", a1: "a11" }],
        b: "b1",
      },
      {
        a: [{ a2: "a21", a1: "a12" }],
        b: "b1",
      },
    ])
  })
})
