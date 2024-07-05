module.exports = {
    testEnvironment: "jsdom",
    restoreMocks: true,
    roots: ["src"],
    moduleDirectories: [
        "node_modules",
        "src"
    ],
    moduleFileExtensions: ["ts", "js"],
    moduleNameMapper: {
        "^obsidian$": "<rootDir>/src/test/mocks/mockObsidian.ts",
    }
}
