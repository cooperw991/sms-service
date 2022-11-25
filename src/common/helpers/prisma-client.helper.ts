import { PrismaClient } from '@prisma/client';

export class GlobalPrismaClient {
  constructor() {
    this.prisma = new PrismaClient();
  }

  private static instance: GlobalPrismaClient;

  public prisma: PrismaClient;

  public static getInstance() {
    if (!this.instance) {
      this.instance = new GlobalPrismaClient();
    }
    return this.instance;
  }
}
