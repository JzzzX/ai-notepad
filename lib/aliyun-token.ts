import crypto from 'crypto';

interface AliyunTokenResponse {
  RequestId?: string;
  Token?: {
    Id?: string;
    ExpireTime?: number;
  };
}

interface CachedToken {
  value: string;
  expireTime: number;
}

const TOKEN_ENDPOINT = 'https://nls-meta.cn-shanghai.aliyuncs.com/';
const TOKEN_API_VERSION = '2019-02-28';
const TOKEN_CACHE_SAFETY_SECONDS = 60;

let cachedToken: CachedToken | null = null;

function percentEncode(value: string): string {
  return encodeURIComponent(value)
    .replace(/\+/g, '%20')
    .replace(/\*/g, '%2A')
    .replace(/%7E/g, '~');
}

function buildSignedUrl(accessKeyId: string, accessKeySecret: string): string {
  const params: Record<string, string> = {
    Action: 'CreateToken',
    AccessKeyId: accessKeyId,
    Format: 'JSON',
    RegionId: 'cn-shanghai',
    SignatureMethod: 'HMAC-SHA1',
    SignatureNonce: crypto.randomUUID(),
    SignatureVersion: '1.0',
    Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    Version: TOKEN_API_VERSION,
  };

  const canonicalized = Object.keys(params)
    .sort()
    .map((key) => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join('&');

  const stringToSign = `GET&${percentEncode('/')}&${percentEncode(canonicalized)}`;
  const signature = crypto
    .createHmac('sha1', `${accessKeySecret}&`)
    .update(stringToSign)
    .digest('base64');

  return `${TOKEN_ENDPOINT}?${canonicalized}&Signature=${percentEncode(signature)}`;
}

export async function getAliyunToken(): Promise<CachedToken> {
  const nowSeconds = Math.floor(Date.now() / 1000);

  if (cachedToken && cachedToken.expireTime - TOKEN_CACHE_SAFETY_SECONDS > nowSeconds) {
    return cachedToken;
  }

  const accessKeyId = process.env.ALICLOUD_ACCESS_KEY_ID;
  const accessKeySecret = process.env.ALICLOUD_ACCESS_KEY_SECRET;

  if (!accessKeyId || !accessKeySecret) {
    throw new Error('缺少阿里云 AK/SK，无法获取 NLS Token');
  }

  const signedUrl = buildSignedUrl(accessKeyId, accessKeySecret);
  const res = await fetch(signedUrl, { method: 'GET' });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`CreateToken 请求失败: ${res.status} ${body}`);
  }

  const data = (await res.json()) as AliyunTokenResponse;
  const token = data.Token?.Id;
  const expireTime = data.Token?.ExpireTime;

  if (!token || !expireTime) {
    throw new Error('CreateToken 响应缺少 Token 信息');
  }

  cachedToken = { value: token, expireTime };
  return cachedToken;
}

