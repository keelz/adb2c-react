import axios from 'axios';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import * as env from '../utils/env';
import * as adb2cConstants from '../constants/adb2c';

const {
  AUTH_DOMAIN,
  currentConfig,
  POLICY_KEY,
  queryParams,
  TENANT_KEY,
  VERIFY_DOMAIN,
} = adb2cConstants;

const { TENANT_NAME } = currentConfig;

const { POLICY_NAME } = queryParams;

const rootUri = `${AUTH_DOMAIN}`.replace(TENANT_KEY, TENANT_NAME);

const loginUri = Object.keys(queryParams)
  .reduce((a, b) => `${a}${queryParams[b]}=${currentConfig[queryParams[b]]}&`, rootUri);

const _redirect = (to) => window.location.href = to;

export const signIn = () => {
  const stateId = uuid();
  localStorage.setItem(stateId, stateId);
  _redirect(`${loginUri}state=${stateId}`);
}

class Adal {
  init() {
    try {
      const parsedHash = this._parseHash(window.location.hash);
      parsedHash && this._verifyLogin(parsedHash);
    } catch(err) {
      env.isDevelopment && console.log(err.message);
    }
  }

  _verifyLogin(parsedHash) {
    const stateKey = localStorage.getItem(parsedHash['state']);
    !env.isDevelopment && stateKey && localStorage.removeItem(parsedHash['state']);
    return stateKey &&
      parsedHash['id_token'] &&
      this._validateToken(parsedHash['id_token'], this._persistToken);
  }

  _persistToken(err, data) {
    if (err) {
      return env.isDevelopment && console.log(err.message);
    }
    console.log(JSON.stringify(data, null, 4));
  }

  async _validateToken(token, cb) {
    try {
      const validAcr = (acr) => acr === String(currentConfig[POLICY_NAME]).toLowerCase();
      const base64ToString = (x) => new Buffer(x, 'base64').toString('ascii');
      const stringToObject = (x) => JSON.parse(x);
      const verifyUri = VERIFY_DOMAIN
        .replace(TENANT_KEY, TENANT_NAME)
        .replace(POLICY_KEY, currentConfig[POLICY_NAME]);
      const tokenDocument = await axios.get(verifyUri);
      const jwks = await axios.get(tokenDocument['data']['jwks_uri']);
      const parsedToken = token.split('.');
      const header = stringToObject(base64ToString(parsedToken[0]));
      const body = stringToObject(base64ToString(parsedToken[1]));
      const keys = jwks['data']['keys'].filter((key) => key['kid'] && key['kid'] === header['kid']);

      const prepadSigned = (hexStr) => {
        const msb = hexStr[0];
        if (msb < '0' || msb > '7') {
          return `00${hexStr}`;
        }
        return hexStr;
      }

      const toHex = (number) => {
        const nstr = number.toString(16);
        if (nstr.length % 2) {
          return `0${nstr}`;
        }
        return nstr;
      }

      const encodeLengthHex = (n) => {
        if (n <= 127) {
          return toHex(n);
        }
        const nHex = toHex(n);
        const lengthOfLengthByte = 128 + nHex.length / 2;
        return toHex(lengthOfLengthByte) + nHex;
      }

      const certToPEM = (cert) => {
        let pem = cert.match(/.{1,64}/g).join('\n');
        pem = `-----BEGIN CERTIFICATE-----\n${pem}\n-----END CERTIFICATE-----\n`;
        return pem;
      }

      const rsaPublicKeyToPEM = (modulusB64, exponentB64) => {
        const modulus = new Buffer(modulusB64, 'base64');
        const exponent = new Buffer(exponentB64, 'base64');
        const modulusHex = prepadSigned(modulus.toString('hex'));
        const expoenntHex = prepadSigned(exponent.toString('hex'));
        const modlen = modulusHex.length / 2;
        const explen = expoenntHex.length / 2;
        const encodedModlen = encodeLengthHex(modlen);
        const encodedExplen = encodeLengthHex(explen);
        const encodedPubKey = '30' +
          encodeLengthHex(modlen + explen + encodedModlen.length / 2 + encodedExplen.length / 2 + 2) +
          '02' + encodedModlen + modulusHex +
          '02' + encodedExplen + expoenntHex;
        const der = new Buffer(encodedPubKey, 'hex')
          .toString('base64');
        let pem = `-----BEGIN RSA PUBLIC KEY-----\n`;
        pem += `${der.match(/.{1,64}/g).join('\n')}`;
        pem += `\n-----END RSA PUBLIC KEY-----\n`;
        return pem;
      }

      const getSigningKey = () => {
        const signingKeys = keys
          .filter((key) => key.use === 'sig' && key.kty === 'RSA' && key.kid && ((key.x5c && key.x5c.length) || (key.n && key.e)))
          .map(key => {
            if (key.x5c && key.x5c.length) {
              return { kid: key.kid, nbf: key.nbf, publicKey: certToPEM(key.x5c[0]) };
            } else {
              return { kid: key.kid, nbf: key.nbf, publicKey: rsaPublicKeyToPEM(key.n, key.e) };
            }
          });
          return signingKeys.length && signingKeys.shift();
      }

      const signingKey = getSigningKey();

      // validate signing key.
      if (!signingKey) {
        return cb && cb(new Error('no valid signing key'));
      }

      // validate acr policy.
      if (!validAcr(body['acr'])) {
        return cb && cb(new Error('invalid acr'));
      }

      // verify token signature & decode.
      jwt.verify(token, signingKey.publicKey, { algorithms: ['RS256'] }, (err, decoded) => {
        if (err) {
          return cb && cb(err);
        }
        cb && cb(null, decoded);
      });
    } catch (err) {
      cb && cb(err);
    };
  }

  _parseHash(hash) {
    const valid = (hash) => hash.match(/#(\w.+)/)[1];
    const stringToArray = (x) => x && x.split('&');
    const arrayToObject = (x) => x && x.reduce((a, b) => {
      const [key, value] = b.split('=');
      return a = Object.assign({}, a, { [key]: value });
    }, null);
    try {
      return arrayToObject(stringToArray(valid(hash)));
    } catch(e) {}
  }
}

export default new Adal();
