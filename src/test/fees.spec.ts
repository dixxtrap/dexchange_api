import { ConfigService } from "@nestjs/config";
import { DatabaseService } from "../module/configuration/database/database.service";
import { TransfertService } from "../module/transfert/transfert.service";



describe('Fees calculation', () => {
     const service = new TransfertService(new DatabaseService, new ConfigService);


     it('applies 0.8% rounded up with bounds [100, 1500]', () => {
          const cases: Array<[number, number]> = [
               [1000, 1000 * 0.18],
               [1500, 1500 * 0.18],
          ];


          for (const [amount, expected] of cases) {
               expect(service.computeFees(amount)).toEqual(expected);
          }
     });
});