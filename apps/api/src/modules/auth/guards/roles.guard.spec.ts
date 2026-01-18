import { Reflector } from "@nestjs/core";
import { RolesGuard } from "./roles.guard";

const mockReflector = (roles?: string[]) => ({
  getAllAndOverride: () => roles,
  get: () => undefined,
  getAll: () => [],
  getAllAndMerge: () => []
});

const mockContext = (role?: string) =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({
        user: role ? { role } : undefined
      })
    }),
    getHandler: () => ({}),
    getClass: () => ({})
  }) as any;

describe("RolesGuard", () => {
  it("allows when no roles metadata", () => {
    const guard = new RolesGuard(mockReflector(undefined) as unknown as Reflector);
    expect(guard.canActivate(mockContext())).toBe(true);
  });

  it("denies when user role not allowed", () => {
    const guard = new RolesGuard(mockReflector(["ADMIN"]) as unknown as Reflector);
    expect(guard.canActivate(mockContext("ENGINEER"))).toBe(false);
  });

  it("allows when user role allowed", () => {
    const guard = new RolesGuard(mockReflector(["SUPPORT"]) as unknown as Reflector);
    expect(guard.canActivate(mockContext("SUPPORT"))).toBe(true);
  });
});
