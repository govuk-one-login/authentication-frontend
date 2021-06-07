import {UserService} from "./user-service";

const isProduction = process.env["NODE_ENV"] === "production";

export const getUserService = (): UserService => {
    return new UserService();
};