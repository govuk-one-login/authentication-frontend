import {UserService} from "./user-service";
import * as dynamoUserService from "./dynamo-user-service"

const isProduction = process.env["NODE_ENV"] === "production";

export function getUserService(): UserService {
    return dynamoUserService;
}