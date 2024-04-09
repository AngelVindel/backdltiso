import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport"; // Importa AuthGuard correctamente

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt'){

}