module.exports = {
    testEnvironment: "jsdom",
    restoreMocks: true,
    roots: ["<rootDir>/src"],
    moduleFileExtensions: ["ts", "js"],
    moduleNameMapper: {
        "^obsidian$": "<rootDir>/src/test/mocks/mockObsidian.ts",
    }
}
