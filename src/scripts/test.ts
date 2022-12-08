import { Injectable, Logger, Inject, LoggerService } from '@nestjs/common';

import { VaisalaClient } from '../common/helpers/vaisala.helper';
import * as dayjs from 'dayjs';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { findPhoneNumbers } from '@/common/utils/string.util';

(async () => {
  const vClient = VaisalaClient.getInstance(
    {
      host: '',
      username: '',
      password: '',
    },
    Logger,
  );

  const eventMsg = '[246397] 重ddsad复：设备“SZ608”上的配置警报';

  const template = vClient.findTemplate(eventMsg);

  console.log(template);

  const params = vClient.generateSMSParams(eventMsg, template);

  console.log(params);
})();
