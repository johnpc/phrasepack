import { defineAuth } from '@aws-amplify/backend';

/**
 * Cognito auth for PhrasePack.
 *
 * The app is GUEST-FIRST: browsing packs, viewing phrases, playing audio, and
 * even generating a new language all work signed-out (via the identity pool's
 * guest role). The `editors` group gates authoring/admin writes and owns write
 * access to the read models — the seed signs in as an editor, and the
 * generation Lambdas write straight to DynamoDB via their own IAM roles.
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  groups: ['editors'],
});
