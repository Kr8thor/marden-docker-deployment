import winston from 'winston';
import config from '../config/index.js';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...rest }) => {
    const restString = Object.keys(rest).length ? `\n${JSON.stringify(rest, null, 2)}` : '';
    return `${timestamp} ${level}: ${message}${restString}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: config.server.env === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'marden-audit' },
  transports: [
    // Write logs with level 'error' and below to error.log
    // Write logs with level 'info' and below to combined.log
    ...(config.server.env === 'production'
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
        ]
      : []),
    // Console output in development
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});

export default logger;
