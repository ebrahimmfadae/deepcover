import { partialPermute } from "./partialPermutation"
import { REMOVE } from "./permutation"
import { enums, one } from "./permutationGenerators"

describe("Test partialPermute", () => {
  it("should generate partial permutation from provided seeds", () => {
    const permuted = Array.from(
      partialPermute(
        { name: "bruce" },
        { name: enums(["alfred", REMOVE]), city: one("Gotham") },
        1,
      ),
    )
    expect(permuted.map((v) => v.data)).toStrictEqual([
      { name: "alfred" },
      {},
      { name: "bruce", city: "Gotham" },
    ])
  })
})
