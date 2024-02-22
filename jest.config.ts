import { JestConfigWithTsJest } from "ts-jest"

export default {
  preset: "ts-jest",
  roots: ["<rootDir>"],
  testEnvironment: "node",
  verbose: true,
  setupFilesAfterEnv: ["jest-extended/all"],
} as JestConfigWithTsJest
