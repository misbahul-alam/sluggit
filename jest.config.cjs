// jest.config.cjs
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  testMatch: ["**/test/**/*.test.ts"],
};
