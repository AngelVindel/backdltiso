/* eslint-disable prettier/prettier */
import { ExtractJwt, Strategy } from "passport-jwt";
import { jwtConstants } from "./jwt.constants";
import { PassportStrategy } from "@nestjs/passport";

export class JwStrategy extends PassportStrategy(Strategy){


    constructor(){

        super({
            
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration:false,
            secretOrKey: jwtConstants.secret,

        })
    }
    async validate(payload:any){

        return {userId:payload.sub,username:payload.username}
    }
}