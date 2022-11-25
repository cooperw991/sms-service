export interface Config {
  nest: NestConfig;
  aliyun: AliyunConfig;
  vaisala: VaisalaConfig;
  crontab: CrontabConfig;
}

export interface NestConfig {
  port: number;
  adminNum: string;
}

export interface AliyunConfig {
  accessKeyId: string;
  accessKeySecret: string;
  endpoint: string;
}

export interface VaisalaConfig {
  host: string;
  username: string;
  password: string;
}

export interface CrontabConfig {
  fetchEvent: string;
  sendMsg: string;
}
