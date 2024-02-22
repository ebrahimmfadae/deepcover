import { permute, REMOVE } from "./permutation"

describe("Test permutation", () => {
  it("should generate permutations for an empty object", () => {
    const permuted = permute({})
    expect(permuted).toStrictEqual([{}])
  })
  it("should generate permutations for a one fielded object", () => {
    const permuted = permute({
      name: ["bruce", "alfred"],
    })
    expect(permuted).toStrictEqual([{ name: "bruce" }, { name: "alfred" }])
  })
  it("should generate permutations for a two fielded object", () => {
    const permuted = permute({
      name: ["bruce", "alfred"],
      quantity: [5, 6],
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
      name: ["bruce", "alfred"],
      quantity: 5,
    })
    expect(permuted).toStrictEqual([
      { name: "bruce", quantity: 5 },
      { name: "alfred", quantity: 5 },
    ])
  })
  it("should generate permutations for a two fielded object with one NON_EXIST value", () => {
    const permuted = permute({
      name: ["bruce", "alfred", REMOVE],
      quantity: [5],
    })
    expect(permuted).toStrictEqual([
      { name: "bruce", quantity: 5 },
      { name: "alfred", quantity: 5 },
      { quantity: 5 },
    ])
  })
  it("should generate permutations for a large object", () => {
    const keyPairs: [number, number[]][] = Array.from(new Array(9), (_, i) => [
      i,
      Array.from(new Array(5), (_, j) => j),
    ])
    const permutationsCount = keyPairs.reduce(
      (acc, curr) => acc * curr[1].length,
      1,
    )
    const input = Object.fromEntries(keyPairs)
    const permuted = permute(input)
    expect(permuted.length).toBe(permutationsCount)
  })
  it("should generate permutations for a tuple", () => {
    const permuted = permute([[{ a: ["a1", "a2"] }, { b: ["b1", "b2"] }]])
    expect(permuted).toStrictEqual([
      [{ a: "a1" }, { b: "b1" }],
      [{ a: "a1" }, { b: "b2" }],
      [{ a: "a2" }, { b: "b1" }],
      [{ a: "a2" }, { b: "b2" }],
    ])
  })
  it("should generate permutations for a nested object", () => {
    const permuted = permute({
      name: [[{ a: ["a1", "a2"] }, { b: ["b1", "b2"] }]],
    })
    expect(permuted).toStrictEqual([
      { name: [{ a: "a1" }, { b: "b1" }] },
      { name: [{ a: "a1" }, { b: "b2" }] },
      { name: [{ a: "a2" }, { b: "b1" }] },
      { name: [{ a: "a2" }, { b: "b2" }] },
    ])
  })
  it("should generate permutations for a complex array object", () => {
    const permuted = permute([
      [
        {
          a: ["a1", "a2"],
          b: ["b1"],
        },
      ],
    ])
    expect(permuted).toStrictEqual([
      [{ b: "b1", a: "a1" }],
      [{ b: "b1", a: "a2" }],
    ])
  })
  it("should generate permutations for a complex first key nested object", () => {
    const permuted = permute({
      a: [
        [
          {
            a1: ["a11", "a12"],
            a2: ["a21"],
          },
        ],
      ],
      b: ["b1"],
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
