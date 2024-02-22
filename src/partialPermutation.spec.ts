import { partialPermute } from "./partialPermutation"
import { REMOVE } from "./permutation"

describe("Test partialPermute", () => {
  it("should generate partial permutation from provided seeds", () => {
    const permuted = partialPermute(
      { name: "bruce" },
      { name: ["alfred", REMOVE], city: "Gotham" },
      1,
    )
    expect(permuted.map((v) => v.data)).toStrictEqual([
      { name: "alfred" },
      {},
      { name: "bruce", city: "Gotham" },
    ])
  })
})
