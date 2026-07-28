/**
 * Configures Amplify (auth + data + storage) from the generated outputs.
 *
 * `amplify_outputs.json` is gitignored and produced by `npm run e2e-config`
 * (sandbox) or `npm run prod-config` (prod). It holds the Cognito pool +
 * AppSync endpoint + S3 bucket — public client config, not secrets. Import this
 * module once, at app startup.
 */
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';

Amplify.configure(outputs);

export { outputs };
