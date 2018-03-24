import envConstants from '../constants/env';

export const isDevelopment = process.env.NODE_ENV === envConstants.DEVELOPMENT;

export const isProduction = process.env.NODE_ENV === envConstants.PRODUCTION;

export const currentEnv = isProduction
? envConstants.PRODUCTION
: envConstants.DEVELOPMENT;

export default envConstants;
