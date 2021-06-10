import {AuthenticationServiceInterface} from "./authentication-service.interface";
import * as authService from "./authentication-service"

export function getUserService(): AuthenticationServiceInterface {
    return authService;
}