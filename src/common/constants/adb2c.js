import envConstants, { currentEnv } from '../utils/env';

export const TENANT_KEY = ':tenant_name';

export const POLICY_KEY = ':policy_name';

export const queryParams = {
  POLICY_NAME: 'p',
  CLIENT_ID: 'client_id',
  NONCE: 'nonce',
  REDIRECT_URI: 'redirect_uri',
  SCOPE: 'scope',
  RESPONSE_TYPE: 'response_type',
  PROMPT: 'prompt',
};

export const BASE_DOMAIN = `https://login.microsoftonline.com/${TENANT_KEY}`;

export const AUTH_DOMAIN = `${BASE_DOMAIN}/oauth2/v2.0/authorize?`;

export const VERIFY_DOMAIN = `${BASE_DOMAIN}/v2.0/.well-known/openid-configuration?p=${POLICY_KEY}`;

export const all = {
  [envConstants.DEVELOPMENT]: {
    [queryParams.CLIENT_ID]: '6709a435-4695-4ff3-8c73-a44f0f1c2f69',
    TENANT_NAME: 'TelematicsB2CQA.onmicrosoft.com',
    [queryParams.POLICY_NAME]: 'B2C_1_TelematicsSignInPolicy',
    [queryParams.NONCE]: 'defaultNonce',
    [queryParams.REDIRECT_URI]: 'http%3A%2F%2Flocalhost%3A3000',
    [queryParams.SCOPE]: 'openid',
    [queryParams.RESPONSE_TYPE]: 'code+id_token',
    [queryParams.PROMPT]: 'login',
  },
  [envConstants.PRODUCTION]: {
    [queryParams.CLIENT_ID]: '6709a435-4695-4ff3-8c73-a44f0f1c2f69',
    TENANT_NAME: 'TelematicsB2CQA.onmicrosoft.com',
    [queryParams.POLICY_NAME]: 'B2C_1_TelematicsSignInPolicy',
    [queryParams.NONCE]: 'defaultNonce',
    [queryParams.REDIRECT_URI]: 'http%3A%2F%2Flocalhost%3A3000',
    [queryParams.SCOPE]: 'openid',
    [queryParams.RESPONSE_TYPE]: 'id_token',
    [queryParams.PROMPT]: 'login',
  },
}

export const currentConfig = all[currentEnv];

export default currentConfig;
