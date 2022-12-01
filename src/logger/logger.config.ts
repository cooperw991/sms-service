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
  new winston.transports.File({
    filename: `logs/combine-${time}.log`,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.ms(),
      nestWinstonModuleUtilities.format.nestLike('MyApp', {
        prettyPrint: true,
      }),
      winston.format.printf((info) => {
        return `${info.level}: ${[info.timestamp]}: ${info.message}`;
      }),
    ),
  }),
  new winston.transports.File({
    filename: `logs/error-${time}.log`,
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.ms(),
      nestWinstonModuleUtilities.format.nestLike('MyApp', {
        prettyPrint: true,
      }),
      winston.format.printf((info) => {
        return `${info.level}: ${[info.timestamp]}: ${info.message}`;
      }),
    ),
  }),
];

export const loggerConfig = {
  transports: [...generalTransports],
};
