import { defineStorage } from '@aws-amplify/backend';

/**
 * S3 storage for PhrasePack media. Per-phrase pronunciation audio lives under
 * `media/phrases/*` and is publicly readable (guest + authenticated) so the
 * guest-first play client can load and play it. Writes are granted to the
 * 'editors' group (group members assume the group's IAM role, so
 * allow.authenticated alone would not authorize them). The langgen Lambdas get
 * additional scoped write grants in backend.ts.
 */
export const storage = defineStorage({
  name: 'phrasepackMedia',
  access: (allow) => ({
    'media/phrases/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read']),
      allow.groups(['editors']).to(['read', 'write', 'delete']),
    ],
  }),
});
