import {
     CanActivate,
     ExecutionContext,
     ForbiddenException,
     Injectable,
     UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
     private readonly validKey: string;

     constructor(private readonly configService: ConfigService) {
          // Lecture de la clé depuis les variables d'environnement
          this.validKey = this.configService.get<string>('API_KEY', 'dev-api-key');
     }

     canActivate(context: ExecutionContext): boolean {
          const request = context.switchToHttp().getRequest();
          const apiKey = request.headers['x-api-key'];

          if (!apiKey) {
               throw new UnauthorizedException('Missing x-api-key header');
          }

          if (apiKey !== this.validKey) {
               throw new ForbiddenException('Invalid API key');
          }

          return true; // autoriser la requête
     }
}
