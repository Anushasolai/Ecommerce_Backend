"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const resolvers_1 = require("../../graphql/resolvers");
const ormconfig_1 = require("../../config/ormconfig");
const axios_1 = __importDefault(require("axios"));
jest.mock("axios");
const EXTERNAL_API_URL = "https://dummyjson.com/products";
const productRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
};
const mockProduct = {
    id: 5,
    title: "Test Product",
    category: "Test Category",
    price: 100,
    rating: 4.5,
    image: "",
};
const mockProductWithImage = Object.assign(Object.assign({}, mockProduct), { image: "https://example.com/default-image.jpg" });
describe("GraphQL Resolvers", () => {
    beforeAll(async () => {
        await ormconfig_1.AppSource.initialize();
    });
    afterAll(async () => {
        await ormconfig_1.AppSource.destroy();
    });
    it("should fetch and store products from external API", async () => {
        axios_1.default.get.mockResolvedValue({
            data: { products: [mockProductWithImage] },
        });
        productRepository.save.mockResolvedValue(mockProductWithImage);
        const result = await resolvers_1.resolvers.Mutation.fetchAndStoreProducts(null, null, {
            productRepository,
        });
        expect(axios_1.default.get).toHaveBeenCalledWith(EXTERNAL_API_URL);
        expect(productRepository.save).toHaveBeenCalledWith([mockProductWithImage]);
        expect(result).toEqual([mockProductWithImage]);
    });
    it("should fetch and store products with default image if image is null", async () => {
        const productWithNullImage = Object.assign(Object.assign({}, mockProduct), { image: null });
        axios_1.default.get.mockResolvedValue({
            data: { products: [productWithNullImage] },
        });
        productRepository.save.mockResolvedValue(Object.assign(Object.assign({}, productWithNullImage), { image: "https://example.com/default-image.jpg" }));
        const result = await resolvers_1.resolvers.Mutation.fetchAndStoreProducts(null, null, {
            productRepository,
        });
        expect(axios_1.default.get).toHaveBeenCalledWith(EXTERNAL_API_URL);
        expect(productRepository.save).toHaveBeenCalledWith([
            Object.assign(Object.assign({}, productWithNullImage), { image: "https://example.com/default-image.jpg" }),
        ]);
        expect(result).toEqual([
            Object.assign(Object.assign({}, productWithNullImage), { image: "https://example.com/default-image.jpg" }),
        ]);
    });
});
//# sourceMappingURL=resolvers.test.js.map