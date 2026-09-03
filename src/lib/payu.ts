import crypto from 'crypto';

export const DEFAULT_PAYU_KEY = '2Eq2v7';
export const DEFAULT_PAYU_SALT = '8qriUoGZC89V6PCxhd2tJoTX61hciCbR';

export function getEffectivePayUKey(): string {
  const key = process.env.PAYU_MERCHANT_KEY;
  if (key && key.trim() !== '' && key !== 'dummy_key') {
    return key.trim();
  }
  return DEFAULT_PAYU_KEY;
}

export function getEffectivePayUSalt(): string {
  const salt = process.env.PAYU_MERCHANT_SALT;
  if (salt && salt.trim() !== '' && salt !== 'dummy_salt') {
    return salt.trim();
  }
  return DEFAULT_PAYU_SALT;
}

export interface PayUGenerateHashParams {
  key: string;
  txnid: string;
  amount: string; // Formatted to 2 decimal places e.g. "499.00"
  productinfo: string;
  firstname: string;
  email: string;
  phone?: string;
  surl: string;
  furl: string;
  salt: string;
  udf1?: string; // e.g. local orderId
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}

export interface PayUVerifyHashParams {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  status: string;
  receivedHash: string;
  salt: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  additionalCharges?: string;
}

/**
 * Generates the PayU checkout request SHA-512 hash:
 * sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
 */
export function generatePayURequestHash(params: PayUGenerateHashParams): string {
  const {
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    salt,
    udf1 = '',
    udf2 = '',
    udf3 = '',
    udf4 = '',
    udf5 = '',
  } = params;

  // PayU hash sequence with 6 trailing pipes before salt (for udf6 to udf10)
  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
  return crypto.createHash('sha512').update(hashString).digest('hex');
}

/**
 * Verifies the PayU response SHA-512 reverse hash:
 * sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 * Or with additionalCharges:
 * sha512(additionalCharges|SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */
export function verifyPayUResponseHash(params: PayUVerifyHashParams): boolean {
  const {
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    status,
    receivedHash,
    salt,
    udf1 = '',
    udf2 = '',
    udf3 = '',
    udf4 = '',
    udf5 = '',
    additionalCharges,
  } = params;

  // Standard reverse hash formula
  let hashString = `${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;

  if (additionalCharges && additionalCharges.trim() !== '') {
    hashString = `${additionalCharges}|${hashString}`;
  }

  const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

  const calcBuf = Buffer.from(calculatedHash.toLowerCase(), 'utf-8');
  const recvBuf = Buffer.from(receivedHash.toLowerCase(), 'utf-8');

  if (calcBuf.length !== recvBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(calcBuf, recvBuf);
}

/**
 * Returns PayU web service / postservice endpoint URL.
 */
export function getPayUPostServiceUrl(): string {
  const env = (process.env.PAYU_ENV || 'prod').toLowerCase();
  return env === 'prod' || env === 'production'
    ? 'https://info.payu.in/merchant/postservice.php?form=2'
    : 'https://test.payu.in/merchant/postservice.php?form=2';
}

/**
 * Generates SHA-512 hash for PayU web service commands (e.g. get_checkout_details):
 * sha512(key|command|var1|salt)
 */
export function generatePayUWebServiceHash(key: string, command: string, var1: string, salt: string): string {
  const hashString = `${key}|${command}|${var1}|${salt}`;
  return crypto.createHash('sha512').update(hashString).digest('hex');
}

/**
 * Calls PayU get_checkout_details API to fetch real-time available paymodes, offers, and downtime status.
 */
export async function fetchPayUCheckoutDetails(amount: number = 100) {
  const key = getEffectivePayUKey();
  const salt = getEffectivePayUSalt();
  const command = 'get_checkout_details';

  const requestPayload = {
    requestId: `req_${Date.now()}`,
    transactionDetails: {
      amount: Number(amount),
    },
    useCase: {
      getExtendedPaymentDetails: true,
    },
  };

  const var1 = JSON.stringify(requestPayload);
  const hash = generatePayUWebServiceHash(key, command, var1, salt);

  const endpoint = getPayUPostServiceUrl();
  const formData = new URLSearchParams();
  formData.append('key', key);
  formData.append('command', command);
  formData.append('var1', var1);
  formData.append('hash', hash);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  const rawText = await response.text();
  try {
    return JSON.parse(rawText);
  } catch {
    return { raw: rawText, status: response.status };
  }
}

/**
 * Returns PayU payment action endpoint URL.
 */
export function getPayUActionUrl(): string {
  const env = (process.env.PAYU_ENV || 'prod').toLowerCase();
  return env === 'prod' || env === 'production'
    ? 'https://secure.payu.in/_payment'
    : 'https://test.payu.in/_payment';
}

/**
 * Checks if live/valid PayU credentials are provided.
 */
export function hasValidPayUConfig(): boolean {
  const key = getEffectivePayUKey();
  const salt = getEffectivePayUSalt();
  return Boolean(
    key && 
    key.trim() !== '' && 
    key !== 'dummy_key' && 
    salt && 
    salt.trim() !== '' && 
    salt !== 'dummy_salt'
  );
}
