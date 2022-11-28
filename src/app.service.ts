import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { EventModel } from './common/helpers/vaisala.helper';
import { ConfigService } from '@nestjs/config';
import {
  AliyunConfig,
  CrontabConfig,
  NestConfig,
  VaisalaConfig,
} from './configs/config.interface';
import { VaisalaClient } from './common/helpers/vaisala.helper';
import { AliCloudClient, SMSParams } from './common/helpers/aliyun.helper';
import * as dayjs from 'dayjs';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { findPhoneNumbers } from '@/common/utils/string.util';

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private scheduler: SchedulerRegistry,
  ) {
    const vConfig = this.config.get<VaisalaConfig>('vaisala');
    this.vClient = VaisalaClient.getInstance(vConfig);

    const aConfig = this.config.get<AliyunConfig>('aliyun');
    this.aClient = AliCloudClient.getInstance(aConfig);

    this.addFetchCronJob();
    this.addSendCronJob();
  }

  private aClient: AliCloudClient;
  private vClient: VaisalaClient;

  addFetchCronJob() {
    const cConfig = this.config.get<CrontabConfig>('crontab');

    const job = new CronJob(cConfig.fetchEvent || '01 * * * * *', () => {
      this.fetchEvents();
    });

    this.scheduler.addCronJob('fetch_event', job);
    job.start();
  }

  addSendCronJob() {
    const cConfig = this.config.get<CrontabConfig>('crontab');

    const job = new CronJob(cConfig.sendMsg || '30 * * * * *', () => {
      this.parseTask();
    });

    this.scheduler.addCronJob('send_msg', job);
    job.start();
  }

  async fetchEvents() {
    await this.vClient.initFetch();

    const lastTask = await this.prisma.sMSTask.findFirst({
      orderBy: {
        eventNum: 'desc',
      },
    });

    const lastNum = lastTask ? +lastTask.eventNum : 0;
    const lastTime = lastTask
      ? lastTask.eventTime
      : dayjs().subtract(5, 'h').unix();

    const events = await this.vClient.fetchEvents({
      categ_filters: 'system',
      text_search: 'sms',
      date_from: lastTime + '',
    });

    const newEvents = events.filter((event) => {
      return event.num > lastNum;
    });

    return this.insertTasks(newEvents);
  }

  async parseTask() {
    const task = await this.prisma.sMSTask.findFirst({
      where: {
        status: 0,
      },
      orderBy: {
        id: 'asc',
      },
    });

    if (!task) {
      return;
    }

    const { eventMsg, eventTargets } = task;

    // TODO：设置 template
    await this.sendSMS({
      phoneNumbers: eventTargets,
      signName: eventMsg,
      templateCode: '',
      templateParam: '',
      smsUpExtendCode: '',
      outId: '',
    });

    try {
      await this.prisma.sMSTask.update({
        where: {
          id: task.id,
        },
        data: {
          status: 1,
        },
      });
    } catch (e) {
      Logger.error(e);
      if (!this.config.get<NestConfig>('nest').adminNum) {
        Logger.log('未设置管理员手机号');
        return;
      }
      await this.sendSMS({
        phoneNumbers: this.config.get<NestConfig>('nest').adminNum,
        signName: '系统错误',
        templateCode: '',
        templateParam: '',
        smsUpExtendCode: '',
        outId: '',
      });
    }
  }

  parseSuccessEvent(event: EventModel): {
    eventMsg: string;
    eventTargets: string;
  } {
    const { msg, extra_fields } = event;
    const eventMsg = this.parseSuccessMsg(msg);
    let eventTargets = [];
    for (const field of extra_fields) {
      eventTargets = [...eventTargets, ...findPhoneNumbers(field.value)];
    }

    return {
      eventMsg,
      eventTargets: eventTargets.join(','),
    };
  }

  parseFailEvent(event: EventModel): {
    eventMsg: string;
    eventTargets: string;
  } {
    const { extra_fields } = event;
    let eventMsg = '';
    let eventTargets = [];

    for (const field of extra_fields) {
      if (field.name === 'SMS text') {
        eventMsg = field.value;
      }
      const phones = findPhoneNumbers(field.value);
      eventTargets = [...eventTargets, ...phones];
    }
    return {
      eventMsg,
      eventTargets: eventTargets.join(','),
    };
  }

  async insertTasks(events: EventModel[]) {
    for (const _event of events) {
      const { eventMsg, eventTargets } =
        _event.msg.indexOf('failed to send sms') !== -1
          ? this.parseFailEvent(_event)
          : this.parseSuccessEvent(_event);

      try {
        await this.prisma.sMSTask.create({
          data: {
            eventNum: _event.num + '',
            eventMsg,
            eventType: 0,
            eventTime: _event.timestamp + '',
            eventTargets,
          },
        });
      } catch (e) {
        Logger.error(e);
        if (!this.config.get<NestConfig>('nest').adminNum) {
          Logger.log('未设置管理员手机号');
          return;
        }
        await this.sendSMS({
          phoneNumbers: this.config.get<NestConfig>('nest').adminNum,
          signName: '系统错误',
          templateCode: '',
          templateParam: '',
          smsUpExtendCode: '',
          outId: '',
        });
      }
    }
  }

  async sendSMS(sms: SMSParams) {
    try {
      await this.aClient.sendSmsReq(sms);
    } catch (e) {
      Logger.error(e);
      throw new Error(`发送短信失败：${e}`);
    }
  }

  parseSuccessMsg(msg: string): string {
    return msg
      .replace('SMS text: \\', '')
      .replace('\\" sent.', '')
      .replace('\\" One or more recipients were refused.', '');
  }
}
