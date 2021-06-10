import {UserService} from "./user-service";
import * as dynamoUserService from "./dynamo-user-service"

export function getUserService(): UserService {
    return dynamoUserService;
}