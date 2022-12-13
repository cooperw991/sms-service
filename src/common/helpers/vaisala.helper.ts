import { LoggerService } from '@nestjs/common';
import { cleanSymbols } from '../utils/string.util';

export interface VaisalaConfig {
  host: string;
  username: string;
  password: string;
}

export interface EventQueryFilter {
  categ_filters: string;
  text_search: string;
  date_from: string;
  date_to?: string;
}

export interface EventModel {
  category: string;
  num: number;
  msg: string;
  timestamp: number;
  extra_fields: {
    name: string;
    value: string;
  }[];
}

export interface SMSTemplate {
  testWords: string[];
  templateName: string;
  templateCode: string;
}

const UNAUTH_ERROR_STR = 'Unauthorized';
const NOT_FOUND_STR = 'Four Hundred and Four';

const TEMPLATES = [
  {
    testWords: ['日期:', '位置/区域:', '阈值条件:', '阈值重复警报:'],
    templateName: '阈值重复警报',
    templateCode: 'SMS_261575026',
  },
  {
    testWords: [
      '重复消息:设备',
      '的',
      '上有通信警报.设备描述:',
      '设备序列号/位置/主机:',
      '因此,以下位置不可用:',
      '警报消息',
    ],
    templateName: '设备通信重复警报',
    templateCode: 'SMS_261540037',
  },
  {
    testWords: ['日期/位置/区域:', '阈值条件:', '已恢复正常:'],
    templateName: '阈值已恢复',
    templateCode: 'SMS_261520026',
  },
  {
    testWords: [
      '设备',
      '的',
      '上有通信警报.设备描述/主机:',
      '因此,以下位置不可用:',
      '警报消息:',
    ],
    templateName: '设备通信警报',
    templateCode: 'SMS_261690022',
  },
  {
    testWords: ['日期:', '位置/区域:', '阈值条件:', '阈值警报:'],
    templateName: '阈值警报',
    templateCode: 'SMS_261095333',
  },
  {
    testWords: ['viewLinc - 到设备', '的通信已恢复设备序列号/位置/主机:'],
    templateName: '设备通信已恢复',
    templateCode: 'SMS_261460032',
  },
  {
    testWords: [
      '设备',
      '的校准状态存储在',
      '上.',
      '设备描述:',
      '设备序列号/校准截止日期:',
    ],
    templateName: '设备校准已恢复',
    templateCode: 'SMS_261520028',
  },
  {
    testWords: [
      '在设备"',
      '"的',
      '上存在设备校准警报.设备校准截止日期:',
      '设备序列号/位置/主机:',
    ],
    templateName: '设备校准警报',
    templateCode: 'SMS_261550032',
  },
  {
    testWords: [
      '重复消息:在设备',
      '的',
      '上存在设备校准警报.设备校准截止日期:',
      '设备序列号/位置/主机:',
    ],
    templateName: '设备校准重复警报',
    templateCode: 'SMS_261115311',
  },
  {
    testWords: ['重复：设备', '上的配置警报'],
    templateName: '设备配置重复失败',
    templateCode: 'SMS_263180201',
  },
  {
    testWords: ['设备', '上的配置警报'],
    templateName: '设备配置失败',
    templateCode: 'SMS_263075220',
  },
  {
    testWords: ['已在', '上恢复配置'],
    templateName: '设备配置已恢复',
    templateCode: 'SMS_263075221',
  },
];

export class VaisalaClient {
  /**
   * 初始化单例
   * @param config: VaisalaConfig
   * @return VaisalaClient
   * @throws Exception
   */
  constructor(config: VaisalaConfig, logger: LoggerService) {
    this.config = config;
    this.logger = logger;
  }

  private static instance: VaisalaClient;
  private config: VaisalaConfig;
  private fetch: any;
  private cookieJar: any;
  private logger: LoggerService;

  /**
   * 初始化单例
   * @param config: VaisalaConfig
   * @return AliCloudClient
   * @throws Exception
   */
  public static getInstance(
    config: VaisalaConfig,
    logger: LoggerService,
  ): VaisalaClient {
    if (!this.instance) {
      this.instance = new VaisalaClient(config, logger);
    }
    return this.instance;
  }

  /**
   * 初始化 fetch 和 cookieJar
   * @param config: VaisalaConfig
   * @return AliCloudClient
   * @throws Exception
   */
  public async initFetch() {
    const { fetch } = (await eval(
      `import('node-fetch-cookies')`,
    )) as typeof import('node-fetch-cookies');
    this.fetch = fetch;
  }

  /**
   * 登录获取 cookie
   * @return Boolean
   * @throws Exception
   */
  public async login(): Promise<boolean> {
    const { host, username, password } = this.config;
    const { CookieJar } = (await eval(
      `import('node-fetch-cookies')`,
    )) as typeof import('node-fetch-cookies');

    this.cookieJar = new CookieJar();
    const res = await this.fetch(
      this.cookieJar,
      `${host}/__login__?username=${username}&password=${password}`,
    );
    if (!res.ok) {
      this.logger.error(`[vaisala]: login 请求失败！Http code: ${res.status}`);
      throw new Error(`login 请求失败！Http code: ${res.status}`);
    }

    return true;
  }

  /**
   * 查询事件
   * @param filter: EventQueryFilter 查询条件
   * @return Boolean
   * @throws Exception
   */
  public async queryEvents(filter: EventQueryFilter): Promise<boolean> {
    const { host } = this.config;
    const { categ_filters, date_from, date_to, text_search } = filter;
    const res = await this.fetch(
      this.cookieJar,
      `${host}/json/api-events_query?categ_filters=${categ_filters}&text_search=${text_search}&date_from=${date_from}`,
    );

    if (!res.ok) {
      this.logger.error(
        `[vaisala]: queryEvents 请求失败！Http code: ${res.status}`,
      );
    }

    const resText = await res.text();

    if (resText === UNAUTH_ERROR_STR || resText === NOT_FOUND_STR) {
      this.cookieJar = null;
      return false;
    }

    return true;
  }

  /**
   * 请求事件内容
   * @param filter: EventQueryFilter 查询条件
   * @param polling: Boolean 是否处于轮询
   * @return EventModel[]
   * @throws Exception
   */
  public async fetchEvents(
    filter: EventQueryFilter,
    polling = false,
  ): Promise<EventModel[]> {
    const { host } = this.config;

    if (!this.cookieJar) {
      await this.login();
    }

    if (!polling) {
      const queryRes = await this.queryEvents(filter);
      if (!queryRes) {
        return [];
      }
      await new Promise((resolve, rejects) => {
        setTimeout(() => {
          resolve(true);
        }, 3000);
      });
    }

    const res = await this.fetch(
      this.cookieJar,
      `${host}/json/api-events?sort=num&dir=desc`,
    );
    if (!res.ok) {
      this.logger.error(
        `[vaisala]: fetchEvents 请求失败！Http code: ${res.status}`,
      );
    }

    const resText = await res.text();

    if (resText === UNAUTH_ERROR_STR || resText === NOT_FOUND_STR) {
      this.cookieJar = null;
      return [];
    }

    if (resText.indexOf('success') === -1) {
      this.logger.error('[vaisala]: ' + resText);
      throw new Error(resText);
    }

    const resJSON = JSON.parse(resText);

    const {
      data: { items, total_count },
    } = resJSON;

    if (!total_count) {
      return [];
    } else {
      if (!items.length) {
        setTimeout(() => {
          return this.fetchEvents(filter, true);
        }, 5000);
      } else {
        return items;
      }
    }
  }

  public findTemplate(msg: string): Partial<SMSTemplate> {
    const pureText = cleanSymbols(msg);
    console.log(pureText);

    for (const template of TEMPLATES) {
      const { testWords } = template;
      let nextIdx = -1;
      let ifMatch = true;
      for (const word of testWords) {
        const index = pureText.indexOf(word);
        if (index <= nextIdx) {
          ifMatch = false;
          break;
        }
        nextIdx = index;
      }

      if (ifMatch) {
        return template;
      }
    }

    return {};
  }

  public parseSuccessMsg(msg: string): string {
    return msg
      .replace('SMS text: "', '')
      .replace('" sent.', '')
      .replace('" One or more recipients were refused.', '');
  }

  public generateSMSParams(msg: string, template: Partial<SMSTemplate>): any {
    const { testWords } = template;
    const pureText = cleanSymbols(msg);

    const valueStr = testWords.reduce((prev, curr) => {
      return prev.replace(curr, '*#06#');
    }, pureText);

    const valueArr = valueStr.split('*#06#');

    switch (template.templateCode) {
      case 'SMS_261575026':
        return this.generateTempl_0(valueArr);
      case 'SMS_261540037':
        return this.generateTempl_1(valueArr);
      case 'SMS_261520026':
        return this.generateTempl_2(valueArr);
      case 'SMS_261690022':
        return this.generateTempl_3(valueArr);
      case 'SMS_261095333':
        return this.generateTempl_4(valueArr);
      case 'SMS_261460032':
        return this.generateTempl_5(valueArr);
      case 'SMS_261520028':
        return this.generateTempl_6(valueArr);
      case 'SMS_261550032':
        return this.generateTempl_7(valueArr);
      case 'SMS_261115311':
        return this.generateTempl_8(valueArr);
      case 'SMS_263075220':
        return this.generateTempl_9(valueArr);
      case 'SMS_263075221':
        return this.generateTempl_10(valueArr);
      case 'SMS_263180201':
        return this.generateTempl_11(valueArr);
      default:
        return null;
    }
  }

  private generateTempl_0(valueArr: string[]): any {
    const dateTime = valueArr[1].trim().split(' ');
    const [LocationName, ...LocationZone] = valueArr[2].trim().split('/');
    const alarm = valueArr[4].split('/');
    const alarmLocation = alarm[1].split(' - ');
    return {
      Date: dateTime[0],
      Time: dateTime[1],
      LocationName,
      LocationZone: LocationZone.join('/'),
      ThresholdCondition: valueArr[3].trim(),
      AlarmMessage: '',
      LocationValue: alarmLocation[0],
      LocationTimestamp: alarmLocation[1].split('+')[0],
    };
  }

  private generateTempl_1(valueArr: string[]): any {
    const device = valueArr[1];
    const time = valueArr[2].split('+')[0].trim();
    const description = valueArr[4].split('/');
    const summary = valueArr[5].split(',');

    return summary.map((item) => {
      const parts = item.split('/');
      console.log(parts);
      return {
        DeviceDescription: device.replace(/"/g, '').replace(/\s+/g, ''),
        AlarmTimestamp: time,
        DeviceSerialNumber: description[0],
        DeviceAddress: description[1],
        DeviceHostName: description[2],
        LocationSummary: `${parts[1]}/${parts[2].split('(')[0]}/${parts[3]
          .split(' ')[0]
          .trim()}`,
        AlarmMessage: ' ',
      };
    });
  }

  private generateTempl_2(valueArr: string[]): any {
    const [dateTime, LocationName, ...region] = valueArr[1].trim().split('/');
    const condition = valueArr[2];
    const [LocationValue, ...locationTime] = valueArr[3].trim().split('°C-');

    return {
      Date: dateTime.split(' ')[0],
      Time: dateTime.split(' ')[1],
      LocationName,
      LocationZone: region.join('/'),
      ThresholdCondition: condition,
      LocationValue: LocationValue + '°C',
      LocationTimestamp: locationTime.join('').split('+')[0],
    };
  }

  private generateTempl_3(valueArr: string[]): any {
    const device = valueArr[1];
    const time = valueArr[2].split('+')[0].trim();
    const description = valueArr[3];
    const summary = valueArr[4].split(',');

    return summary.map((item) => {
      const parts = item.split('/');

      return {
        DeviceDescription: device.replace(/"/g, '').replace(/\s+/g, ''),
        AlarmTimestamp: time,
        DeviceHostName: description.split('/')[1],
        LocationSummary: `${parts[1]}/${
          parts[2].split('(')[0]
        }/${parts[3].replace(' ', '')}`,
        DeviceLabel: '',
      };
    });
  }

  private generateTempl_4(valueArr: string[]): any {
    const dateTime = valueArr[1].trim().split(' ');
    const [LocationName, ...LocationZone] = valueArr[2].trim().split('/');
    const alarm = valueArr[4].split('/');
    const alarmLocation = alarm[1].split(' - ');
    return {
      Date: dateTime[0],
      Time: dateTime[1],
      LocationName,
      LocationZone: LocationZone.join('/'),
      ThresholdCondition: valueArr[3].trim(),
      AlarmType: alarm[0],
      LocationValue: alarmLocation[0],
      LocationTimestamp: alarmLocation[1].split('+')[0],
    };
  }

  private generateTempl_5(valueArr: string[]): any {
    const [DeviceSerialNumber, ...others] = valueArr[2].split('/');
    const hostName = others.slice(-1);
    const address = others.slice(0, -1);

    return {
      DeviceDescription: valueArr[1].trim().replace(/"/g, ''),
      DeviceSerialNumber: DeviceSerialNumber.trim(),
      DeviceAddress: address.join('/').trim(),
      DeviceHostName: hostName[0].trim(),
    };
  }

  private generateTempl_6(valueArr: string[]): any {
    const DeviceDescription = valueArr[1].trim().replace(/"/g, '');
    const AlarmDeactivationTimestamp = valueArr[2].trim().split('+')[0];
    const [DeviceSerialNumber, ...other] = valueArr[4].split('/');

    return {
      DeviceDescription,
      AlarmDeactivationTimestamp,
      DeviceSerialNumber,
      DeviceNextCalDate: other.join('/').trim().split('+')[0],
    };
  }

  private generateTempl_7(valueArr: string[]): any {
    const [DeviceSerialNumber, ...other] = valueArr[4].split('/');

    const hostName = other.slice(-1);
    const address = other.slice(0, -1);

    return {
      DeviceDescription: valueArr[1].trim().replace(/"/g, ''),
      AlarmTimestamp: valueArr[2].split('+')[0].trim(),
      DeviceSerialNumber,
      DeviceNextCalDate: valueArr[3].split('+')[0].trim(),
      DeviceAddress: address.join('/'),
      DeviceHostName: hostName[0].trim(),
    };
  }

  private generateTempl_8(valueArr: string[]): any {
    const [DeviceSerialNumber, ...other] = valueArr[4].split('/');

    const hostName = other.slice(-1);
    const address = other.slice(0, -1);

    return {
      DeviceDescription: valueArr[1].trim().replace(/"/g, ''),
      AlarmTimestamp: valueArr[2].split('+')[0].trim(),
      DeviceSerialNumber,
      DeviceNextCalDate: valueArr[3].split('+')[0].trim(),
      DeviceAddress: address.join('/'),
      DeviceHostName: hostName[0].trim(),
    };
  }

  private generateTempl_9(valueArr: string[]): any {
    return {
      DeviceDescription: valueArr[1].trim(),
    };
  }

  private generateTempl_10(valueArr: string[]): any {
    return {
      DeviceDescription: valueArr[1].trim(),
    };
  }

  private generateTempl_11(valueArr: string[]): any {
    return {
      DeviceDescription: valueArr[1].trim(),
    };
  }
}
