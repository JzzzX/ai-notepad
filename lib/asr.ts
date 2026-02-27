export type AsrMode = 'browser' | 'aliyun';

export interface AsrStatus {
  mode: AsrMode;
  provider: 'web-speech' | 'aliyun';
  ready: boolean;
  missing: string[];
  message: string;
}

const REQUIRED_ALIYUN_ENV = [
  'ALICLOUD_ACCESS_KEY_ID',
  'ALICLOUD_ACCESS_KEY_SECRET',
  'ALICLOUD_ASR_APP_KEY',
] as const;

export function getAsrMode(): AsrMode {
  const mode = process.env.ASR_MODE?.toLowerCase();
  return mode === 'aliyun' ? 'aliyun' : 'browser';
}

export function getAsrStatus(): AsrStatus {
  const mode = getAsrMode();

  if (mode === 'browser') {
    return {
      mode,
      provider: 'web-speech',
      ready: true,
      missing: [],
      message: '使用浏览器 Web Speech API（Demo 模式）',
    };
  }

  const missing = REQUIRED_ALIYUN_ENV.filter((name) => !process.env[name]);
  const ready = missing.length === 0;

  return {
    mode,
    provider: 'aliyun',
    ready,
    missing: [...missing],
    message: ready
      ? '已配置阿里云 ASR，可使用实时转写'
      : '阿里云 ASR 配置不完整，暂不可用',
  };
}
