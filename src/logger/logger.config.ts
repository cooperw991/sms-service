import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as dayjs from 'dayjs';

const time = dayjs().format('YYYY-MM-DD');
winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'blue',
  debug: 'green',
});

const generalTransports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.ms(),
      nestWinstonModuleUtilities.format.nestLike('MyApp', {
        prettyPrint: true,
        colors: true,
      }),
    ),
  }),
];

const errorTransports = [
  new winston.transports.File({
    filename: `logs/${time}-error.log`,
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.ms(),
      nestWinstonModuleUtilities.format.nestLike('MyApp', {
        prettyPrint: true,
      }),
    ),
  }),
];

export const loggerConfig = {
  level: 'info',
  transports:
    process.env.NODE_ENV === 'production'
      ? [...generalTransports, ...errorTransports]
      : generalTransports,
};
