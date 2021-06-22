import { AuthenticationServiceInterface } from "./authentication-service.interface";
import * as authService from "./authentication-service";
import * as notificationService from "./notification-service";
import { NotificationServiceInterface } from "./notification-service.interface";

export function getUserService(): AuthenticationServiceInterface {
  return authService;
}

export function getNotificationService(): NotificationServiceInterface {
  return notificationService;
}
