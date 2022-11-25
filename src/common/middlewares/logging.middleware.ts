import { Logger } from '@nestjs/common';

const loggingMiddleware = async (params, next) => {
  const before = Date.now();

  const result = await next(params);

  const after = Date.now();

  Logger.log(`Query ${params.model}.${params.action} took ${after - before}ms`);

  return result;
};

export { loggingMiddleware };
