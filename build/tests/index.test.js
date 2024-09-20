"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const ormconfig_1 = require("../config/ormconfig");
beforeAll(async () => {
    if (!ormconfig_1.AppSource.isInitialized) {
        await ormconfig_1.AppSource.initialize();
    }
});
afterAll(async () => {
    if (ormconfig_1.AppSource.isInitialized) {
        await ormconfig_1.AppSource.destroy();
    }
});
describe("checkConnection", () => {
    it("should establish a database connection successfully", async () => {
        await expect((0, index_1.checkConnection)()).resolves.not.toThrow();
    });
});
//# sourceMappingURL=index.test.js.map