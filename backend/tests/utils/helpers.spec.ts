import { getPaginationParams, calculatePages } from "../../src/utils/helpers.js";

describe("helpers utility", () => {
  it("normalizes pagination params and calculates offset", () => {
    const result = getPaginationParams("2", "10");

    expect(result).toEqual({
      page: 2,
      limit: 10,
      offset: 10
    });
  });

  it("caps limit at 100 and lower-bounds page to 1", () => {
    const result = getPaginationParams("0", "200");

    expect(result).toEqual({
      page: 1,
      limit: 100,
      offset: 0
    });
  });

  it("calculates total pages correctly", () => {
    expect(calculatePages(95, 10)).toBe(10);
    expect(calculatePages(100, 20)).toBe(5);
    expect(calculatePages(0, 10)).toBe(0);
  });
});
