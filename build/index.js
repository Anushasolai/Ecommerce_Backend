"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkConnection = void 0;
const ormconfig_1 = require("./config/ormconfig");
const checkConnection = async () => {
    try {
        if (!ormconfig_1.AppSource.isInitialized) {
            console.log("Initializing DataSource...");
            await ormconfig_1.AppSource.initialize();
            console.log("DataSource Initialized Successfully");
        }
        else {
            console.log("DataSource already initialized");
        }
    }
    catch (error) {
        console.error("DataSource not Initialized:", error);
    }
};
exports.checkConnection = checkConnection;
//# sourceMappingURL=index.js.map