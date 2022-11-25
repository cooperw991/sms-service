import { Logger } from '@nestjs/common';

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

const UNAUTH_ERROR_STR = 'Unauthorized';
const NOT_FOUND_STR = 'Four Hundred and four';

export class VaisalaClient {
  /**
   * 初始化单例
   * @param config: VaisalaConfig
   * @return VaisalaClient
   * @throws Exception
   */
  constructor(config: VaisalaConfig) {
    this.config = config;
  }

  private static instance: VaisalaClient;
  private config: VaisalaConfig;
  private fetch: any;
  private cookieJar: any;

  /**
   * 初始化单例
   * @param config: VaisalaConfig
   * @return AliCloudClient
   * @throws Exception
   */
  public static getInstance(config: VaisalaConfig): VaisalaClient {
    if (!this.instance) {
      this.instance = new VaisalaClient(config);
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
    const { CookieJar, fetch } = (await eval(
      `import('node-fetch-cookies')`,
    )) as typeof import('node-fetch-cookies');
    this.fetch = fetch;
    this.cookieJar = new CookieJar();
  }

  /**
   * 登录获取 cookie
   * @return Boolean
   * @throws Exception
   */
  public async login(): Promise<boolean> {
    const { host, username, password } = this.config;
    const res = await this.fetch(this.cookieJar, `${host}/__login__`, {
      body: `username=${username}&password=${password}`,
      method: 'POST',
    });
    if (!res.ok) {
      Logger.error(`请求失败！Http code: ${res.status}`);
      throw new Error(`请求失败！Http code: ${res.status}`);
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
      `${host}/json/api-events_query`,
      {
        body: `categ_filters=${categ_filters}&text_search=${text_search}&date_from=${date_from}&date_to=${date_to}`,
        method: 'POST',
      },
    );
    if (!res.ok) {
      Logger.error(`请求失败！Http code: ${res.status}`);
      throw new Error(`请求失败！Http code: ${res.status}`);
    }

    const resText = await res.text();

    if (resText === UNAUTH_ERROR_STR || resText === NOT_FOUND_STR) {
      await this.login();
      return this.queryEvents(filter);
    }

    if (resText.indexOf('success') === -1) {
      Logger.error(resText);
      throw new Error(resText);
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

    if (!polling) {
      await this.queryEvents(filter);
    }

    const res = await this.fetch(this.cookieJar, `${host}/json/api-events`, {
      method: 'POST',
    });
    if (!res.ok) {
      Logger.error(`请求失败！Http code: ${res.status}`);
      throw new Error(`请求失败！Http code: ${res.status}`);
    }

    const resText = await res.text();

    if (resText === UNAUTH_ERROR_STR || resText === NOT_FOUND_STR) {
      await this.login();
      return this.fetchEvents(filter);
    }

    if (resText.indexOf('success') === -1) {
      Logger.error(resText);
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
}
