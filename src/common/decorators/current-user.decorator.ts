// =============================================================
// Mango · src/common/decorators/current-user.decorator.ts
// -------------------------------------------------------------
// @CurrentUser() inyecta el payload JWT del request en un
// parámetro del handler del controller.
// =============================================================

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // adjuntado por JwtStrategy.validate()
  },
);
