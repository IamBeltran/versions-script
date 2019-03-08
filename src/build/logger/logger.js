//  ┌───────────────────────────────────────────────────────────────────────────────────┐
//  │  REQUIRE THIRD-PARTY MODULES DEPENDENCY.                                          │
//  └───────────────────────────────────────────────────────────────────────────────────┘
const winston = require('winston');
const moment = require('moment-timezone');

//  ┌───────────────────────────────────────────────────────────────────────────────────┐
//  │  REQUIRE NODE-MODULE DEPENDENCIES.                                                │
//  └───────────────────────────────────────────────────────────────────────────────────┘
const path = require('path');
const fs = require('fs');
const os = require('os');

//  ──[ UTILS.  ]────────────────────────────────────────────────────────────────────────
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

//  ┌───────────────────────────────────────────────────────────────────────────────────┐
//  │  DESTRUCTURING OF OBJETS.                                                         │
//  └───────────────────────────────────────────────────────────────────────────────────┘

//  ──[ DESTRUCTURING WINSTON.  ]────────────────────────────────────────────────────────
const { createLogger, format, config, transports } = winston;

//  ──[ DESTRUCTURING FORMAT. ]──────────────────────────────────────────────────────────
const { combine, json, printf, colorize, ms, errors } = format;

//  ──[ DESTRUCTURING CONFIG.  ]─────────────────────────────────────────────────────────
const { addColors } = config;

//  ┌───────────────────────────────────────────────────────────────────────────────────┐
//  │  DECLARATION OF CONSTANTS.                                                        │
//  └───────────────────────────────────────────────────────────────────────────────────┘

//  ──[ DIRECTORY FOR LOGS.  ]───────────────────────────────────────────────────────────
const dirLog = resolveApp(`logs`);

//  ──[ CREATE DIRECTORY. ]──────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-expressions
fs.existsSync(dirLog) || fs.mkdirSync(dirLog);

//  ──[ DATE FOR NAME. ]─────────────────────────────────────────────────────────────────
const dateLog = moment.tz('America/Mexico_City').format('YYYY-MM-DD');

//  ──[ NAME FOR FILE.  ]────────────────────────────────────────────────────────────────
const nameError = `error_${dateLog}.log`;
const nameInfo = `info_${dateLog}.log`;

//  ──[ PATH FOR FILE.  ]────────────────────────────────────────────────────────────────
const fileError = `${dirLog}/${nameError}`;
const fileInfo = `${dirLog}/${nameInfo}`;

//  ┌───────────────────────────────────────────────────────────────────────────────────┐
//  │  OPTIONS FOR MODULE LOGGER.                                                       │
//  └───────────────────────────────────────────────────────────────────────────────────┘

//  ──[ OPTIONS. ]───────────────────────────────────────────────────────────────────────
const options = {
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'green',
    verbose: 'cyan',
    debug: 'blue',
    silly: 'magenta',
  },
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
  },
};

//  ┌───────────────────────────────────────────────────────────────────────────────────┐
//  │  FUNCTIONS TO FORMAT DATA.                                                        │
//  └───────────────────────────────────────────────────────────────────────────────────┘

//  ──[ APPEND TIMESTAMP. ]──────────────────────────────────────────────────────────────
const appendTimestamp = format((info, opts) => {
  info.timestamp = moment()
    .tz(opts.tz || 'America/Mexico_City')
    .format(opts.format || 'YYYY-MM-DD hh:mm:ss:ms');
  return info;
});

//  ──[ APPEND LABEL. ]──────────────────────────────────────────────────────────────────
const appendLabel = format(info => {
  info.label = info.label || 'Default';
  return info;
});

//  ┌───────────────────────────────────────────────────────────────────────────────────┐
//  │  FUNCTIONS TO FORMAT TRANSPORTS.                                                  │
//  └───────────────────────────────────────────────────────────────────────────────────┘

//  ──[ FORMAT FILE. ]───────────────────────────────────────────────────────────────────
const formatFile = combine(
  errors({ stack: true }),
  json(info => {
    const { timestamp, label, level, message, ms } = info;
    return `${timestamp}${level}${label}${message}${ms}`;
  }),
);

//  ──[ FORMAT CONSOLE. ]────────────────────────────────────────────────────────────────
const formatConsole00 = combine(
  colorize({ all: true }),
  printf(info => {
    const { timestamp, label, level, message, ms, ...args } = info;
    return Object.keys(args).length
      ? `${timestamp} ${level} ${label}: ${message}:\n${JSON.stringify(args, null, 2)}`
      : `${timestamp} ${level} ${label}: ${message}`;
  }),
);

const formatConsole01 = combine(
  colorize({ all: true }),
  ms(),
  printf(info => {
    const { timestamp, label, level, message, ms, ...args } = info;
    return Object.keys(args).length
      ? `${ms.padEnd(6)}- ${message}:\n${JSON.stringify(args, null, 2)}`
      : `${ms.padEnd(6)}- ${message}`;
  }),
);

//  ┌───────────────────────────────────────────────────────────────────────────────────┐
//  │  SETTINGS OF TRANSPORTS.                                                          │
//  └───────────────────────────────────────────────────────────────────────────────────┘

//  ──[ SETTING COLORS. ]────────────────────────────────────────────────────────────────
addColors(options.colors);

//  ┌───────────────────────────────────────────────────────────────────────────────────┐
//  │  CREATE LOGGER.                                                                   │
//  └───────────────────────────────────────────────────────────────────────────────────┘
const logger = createLogger({
  level: 'info',
  levels: options.levels,
  format: combine(appendTimestamp(), appendLabel()),
  transports: [
    new transports.Console({
      name: 'CONSOLE_FOR_MIDDLEWARE',
      level: 'debug',
      silent: false,
      stderrLevels: ['error', 'debug', 'info'],
      consoleWarnLevels: ['warn', 'debug', 'info'],
      handleExceptions: false,
      eol: os.EOL,
      json: false,
      colorize: true,
      format: formatConsole01,
      options: {
        flags: 'a+',
        encoding: 'utf8',
        mode: 0o666,
      },
    }),
    new transports.File({
      name: 'FILE_FOR_ERROR',
      level: 'error',
      silent: false,
      colorize: false,
      eol: os.EOL,
      filename: fileError,
      format: formatFile,
      handleExceptions: false,
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      tailable: true,
      maxRetries: 10,
      zippedArchive: false,
      options: {
        flags: 'a+',
        encoding: 'utf8',
        mode: 0o666,
      },
    }),
    new transports.File({
      name: 'FILE_FOR_INFO',
      level: 'info',
      silent: false,
      colorize: false,
      eol: os.EOL,
      filename: fileInfo,
      format: formatFile,
      handleExceptions: false,
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      tailable: true,
      maxRetries: 10,
      zippedArchive: false,
      options: {
        flags: 'a+',
        encoding: 'utf8',
        mode: 0o666,
      },
    }),
  ],
  exitOnError: false,
  silent: false,
});

//  ┌───────────────────────────────────────────────────────────────────────────────────┐
//  │  ADD LOGGER FOR STREAM.                                                           │
//  └───────────────────────────────────────────────────────────────────────────────────┘
logger.stream = {
  success: {
    write: message => {
      logger.log({
        level: 'info',
        label: 'HTTP',
        message: message.trim(),
      });
    },
  },
  error: {
    write: message => {
      logger.log({
        level: 'error',
        label: 'HTTP',
        message: message.trim(),
      });
    },
  },
};

//  ──[ EXPORT MODULE ]──────────────────────────────────────────────────────────────────
module.exports = logger;
