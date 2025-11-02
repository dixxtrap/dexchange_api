import { PrismaClient } from '.prisma/client/client';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';



@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {


     constructor() {
          super();
          // Remplacer l’instance interne par une version étendue

     }

     async onModuleInit() {

          await this.$connect();
     }

     async onModuleDestroy() {
          await this.$disconnect();

     }
}