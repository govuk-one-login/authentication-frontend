## What

<!-- Describe what you have changed and why -->

## How to review

<!-- Describe the steps required to review this PR.
For example:

1. Code Review
1. Deploy to a dev environment using the [GitHub dev deployment workflow](https://github.com/govuk-one-login/authentication-frontend/actions/workflows/build-deploy-frontend-dev.yml)
1. Ensure that resources `x`, `y` and `z` were not changed
1. Visit [some url](https://some.dev.url/to/visit)
1. Sign in
1. Ensure `x` message appears in a modal
-->

## Checklist

<!-- Performance analysis notice
Make sure that a performance analyst colleague in your team has been informed of any changes to the user interfaces or user journeys.

Delete this item if the PR does not change any UI or user journeys.
-->

- [ ] Performance analyst has been notified of the change.

<!-- UCD review
Changes to the user journeys, the UI or content should be reviewed by Content Design and Interaction Design before being merged.

This is to ensure:
- They have an opportunity to confirm the implementation meets expectations.
  - For example, how error screens appear and whether invalid entries can be amended.
- They can make any necessary changes to Figma designs.

It is also important that new features have a full end-to-end journey review before going live. Ensure this is done before enabling a feature flag that changes the frontend.

Contact UCD colleagues in the Authentication team to identify the best way to approach the review.

If including screenshots in the PR description, include those representing error states. Here are some examples:
- a PR that uses tables to display the screenshots https://github.com/govuk-one-login/authentication-frontend/pull/1187
- a PR that uses a dropdown to display the screenshots https://github.com/alphagov/di-infrastructure/pull/578

You can find example PRs from this repository that include screenshots through this search: https://github.com/govuk-one-login/authentication-frontend/pulls?q=is%3Apr+screenshots+is%3Aclosed+is%3Amerged

Delete this item if the PR does not change the UI.
-->

- [ ] A UCD review has been performed.

<!-- Acceptance tests have been updated
This is to avoid failures occurring after a merge. The types of changes that may impact acceptance tests might be:

- changes to user journeys
- changes to the text of page titles
- changes to the text of interactive elements (such as links).

The Test Engineers on the Authentication Team will be happy to discuss any changes if you're unsure.
-->

- [ ] Any necessary changes to the [acceptance tests](https://github.com/govuk-one-login/authentication-acceptance-tests) have been made.

<!-- Associated documentation has been updated
This might include updates to the README.md, Confluence pages etc.
-->

- [ ] Documentation has been updated to reflect these changes.

## Related PRs

<!-- Links to PRs in other repositories that are relevant to this PR.

This could be:
  - PRs that depend on this one
  - PRs this one depends on
  - If this work is being duplicated in other repos, other PRs
  - PRs which just provide context to this one. -->

<!-- Delete this section if not needed! -->
