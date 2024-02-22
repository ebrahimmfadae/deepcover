import { subsetWithSize } from "./subset"

describe("Test subsetWithSize", () => {
  it("should generate single member subset from an object with three fields", () => {
    const subset = subsetWithSize({
      firstName: "bruce",
      lastName: "wayne",
      heroName: "batman",
    })
    expect(subset).toStrictEqual([
      { firstName: "bruce" },
      { lastName: "wayne" },
      { heroName: "batman" },
    ])
  })
})
