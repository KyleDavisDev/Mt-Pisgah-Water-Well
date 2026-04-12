jest.mock("../repositories/userRepository", () => ({
  UserRepository: {}
}));

jest.mock("../repositories/paymentRepository", () => ({
  PaymentRepository: {}
}));

jest.mock("../repositories/invoiceRepository", () => ({
  InvoiceRepository: {}
}));

jest.mock("../repositories/homeownerRepository", () => ({
  HomeownerRepository: {}
}));

jest.mock("../repositories/propertyRepository", () => ({
  PropertyRepository: {}
}));

jest.mock("../repositories/billRepository", () => ({
  BillRepository: {}
}));

jest.mock("../repositories/FeeRepository", () => ({
  FeeRepository: {}
}));

import { getAdjacentMonthRanges } from "./utils";

describe("getAdjacentMonthRanges", () => {
  it("should return start of current month", () => {
    // Given
    const year = "2025";
    const month = "2";

    // When
    const result = getAdjacentMonthRanges(year, month);

    // Then
    expect(result.startOfCurrentMonth).toBe("2025-02-01");
  });

  it("should return end of current month", () => {
    // Given
    const year = "2025";
    const month = "2";

    // When
    const result = getAdjacentMonthRanges(year, month);

    // Then
    expect(result.endOfCurrentMonth).toBe("2025-02-28");
  });

  it("should return start of previous month within same year", () => {
    // Given
    const year = "2025";
    const month = "2";

    // When
    const result = getAdjacentMonthRanges(year, month);

    // Then
    expect(result.startOfPreviousMonth).toBe("2025-01-01");
  });

  it("should return end of previous month within same year", () => {
    // Given
    const year = "2025";
    const month = "2";

    // When
    const result = getAdjacentMonthRanges(year, month);

    // Then
    expect(result.endOfPreviousMonth).toBe("2025-01-28");
  });

  it("should return start of next month within same year", () => {
    // Given
    const year = "2025";
    const month = "2";

    // When
    const result = getAdjacentMonthRanges(year, month);

    // Then
    expect(result.startOfNextMonth).toBe("2025-03-01");
  });

  it("should return end of next month within same year", () => {
    // Given
    const year = "2025";
    const month = "2";

    // When
    const result = getAdjacentMonthRanges(year, month);

    // Then
    expect(result.endOfNextMonth).toBe("2025-03-28");
  });

  it("should return previous month in prior year when month is January", () => {
    // Given
    const year = "2025";
    const month = "1";

    // When
    const result = getAdjacentMonthRanges(year, month);

    // Then
    expect(result.startOfPreviousMonth).toBe("2024-12-01");
  });

  it("should return next month in next year when month is December", () => {
    // Given
    const year = "2025";
    const month = "12";

    // When
    const result = getAdjacentMonthRanges(year, month);

    // Then
    expect(result.startOfNextMonth).toBe("2026-01-01");
  });

  it("should clamp month to January when month less than one", () => {
    // Given
    const year = "2025";
    const month = "0";

    // When
    const result = getAdjacentMonthRanges(year, month);

    // Then
    expect(result.startOfCurrentMonth).toBe("2025-01-01");
  });

  it("should clamp month to January when month is greater than twelve", () => {
    // Given
    const year = "2025";
    const month = "13";

    // When
    const result = getAdjacentMonthRanges(year, month);

    // Then
    expect(result.startOfCurrentMonth).toBe("2025-01-01");
  });

  it("should clamp month to January when month is not numeric", () => {
    // Given
    const year = "2025";
    const month = "abc";

    // When
    const result = getAdjacentMonthRanges(year, month);

    // Then
    expect(result.startOfCurrentMonth).toBe("2025-01-01");
  });
});
