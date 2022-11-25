import Dysmsapi20170525, * as $Dysmsapi20170525 from '@alicloud/dysmsapi20170525';
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
import Util, * as $Util from '@alicloud/tea-util';
import { Logger } from '@nestjs/common';
import { AliyunConfig } from '../../configs/config.interface';

export interface SMSParams {
  // 接受短信的手机号码
  phoneNumbers: string;
  // 短信签名名称
  signName: string;
  // 短信模板 code
  templateCode: string;
  // 短信模板变量对应的实际值
  templateParam?: string;
  // 上行短信扩展码
  smsUpExtendCode?: string;
  // 外部流水扩展字段
  outId?: string;
}

export class AliCloudClient {
  /**
   * 使用AK&SK初始化账号Client
   * @param config: AliyunConfig
   * @return AliCloudClient
   * @throws Exception
   */
  constructor(config: AliyunConfig) {
    const $config = new $OpenApi.Config(config);
    this.client = new Dysmsapi20170525($config);
  }

  private static instance: AliCloudClient;
  private client: Dysmsapi20170525;

  /**
   * 初始化单例
   * @param config: AliyunConfig
   * @return AliCloudClient
   * @throws Exception
   */
  public static getInstance(config: AliyunConfig): AliCloudClient {
    if (!this.instance) {
      this.instance = new AliCloudClient(config);
    }
    return this.instance;
  }

  /**
   * 发送短信方法
   * @param params: SMSParams
   * @return Boolean
   * @throws Exception
   */
  public async sendSmsReq(params: SMSParams): Promise<boolean> {
    const sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest(params);
    const runtime = new $Util.RuntimeOptions({});
    try {
      await this.client.sendSmsWithOptions(sendSmsRequest, runtime);
    } catch (error) {
      // 如有需要，请打印 error
      Logger.error(error.message);
      Util.assertAsString(error.message);
      return false;
    }
    return true;
  }
}
