# Service down page for GOV.UK Sign in

This is a single page app hosted by Nginx, which is to be used when the GOV.UK sign in service is down. This is not performed automatically and requires manual intervention to launch the page.

For Production :

## Turning on the service-down page

1. Sign in to the `gds-di-production` AWS account.
2. Navigate to the **EC2** control panel.
3. Navigate to the **Load Balancers**, and select `production-frontend`.
4. On Listeners and rules tab Click `3 rules` on `HTTPS:443` listeners
5. Select checkbox on second rule with priority 1000 and then select edit rule from Action dropdown
6. Select checkbox on condition `Path (1)` and click edit
7. Change the path to be `*` and confirm followed by next , next & save changes.

## Turning off the service-down page

1. Sign in to the `gds-di-production` AWS account.
2. Navigate to the **EC2** control panel.
3. Navigate to the **Load Balancers**, and select `production-frontend`.
4. On Listeners and rules tab Click `3 rules` on `HTTPS:443` listeners
5. Select checkbox on second rule with priority 1000 and then select edit rule from Action dropdown
6. Select checkbox on condition `Path (1)` and click edit
7. Change the path to be `/service-page-disabled/*`and confirm followed by next , next & save changes.
