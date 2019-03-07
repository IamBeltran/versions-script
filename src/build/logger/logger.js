//  ┌───────────────────────────────────────────────────────────────────────────────────┐
//  │  REQUIRE THIRD-PARTY MODULES DEPENDENCY.                                          │
//  └───────────────────────────────────────────────────────────────────────────────────┘
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
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
const { combine, json, printf, colorize } = format;

//  ──[ DESTRUCTURING CONFIG.  ]─────────────────────────────────────────────────────────
const { addColors } = config;

//  ┌───────────────────────────────────────────────────────────────────────────────────┐
//  │  DECLARATION OF CONSTANTS.                                                        │
//  └───────────────────────────────────────────────────────────────────────────────────┘

//  ──[ PATHS MODULES.  ]────────────────────────────────────────────────────────────────
const logDirectory = resolveApp(`logs`);
const rotateDirectory = resolveApp(`logs/rotate`);

//  ──[ CREATE DIRECTORY. ]──────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-expressions
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
// eslint-disable-next-line no-unused-expressions
fs.existsSync(rotateDirectory) || fs.mkdirSync(rotateDirectory);

//  ──[ DATE FOR NAME. ]─────────────────────────────────────────────────────────────────
// const DATE_LOG = moment.tz('America/Mexico_City').format('YYYY-MM-DD');

//  ──[ NAME FOR FILE.  ]────────────────────────────────────────────────────────────────
const NAME_ERROR = `LOG_ERROR.log`;
const NAME_INFO = `LOG_INFO.log`;

const FILE_ERROR = `${logDirectory}/${NAME_ERROR}`;
const FILE_INFO = `${logDirectory}/${NAME_INFO}`;

//  ┌───────────────────────────────────────────────────────────────────────────────────┐
//  │  SETTINGS FOR MODULE.                                                             │
//  └───────────────────────────────────────────────────────────────────────────────────┘

//  ──[ APPEND TIMESTAMP. ]──────────────────────────────────────────────────────────────
const appendTimestamp = format((info, opts) => {
  info.timestamp = moment()
    .tz(opts.tz || 'America/Mexico_City')
    .format('YYYY-MM-DD hh:mm:ss:ms');
  return info;
});

//  ──[ APPEND LABEL. ]──────────────────────────────────────────────────────────────────
const appendLabel = format(info => {
  info.label = info.label || 'Default';
  return info;
});
//  ──[ SETTING COLORS. ]────────────────────────────────────────────────────────────────

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

addColors(options.colors);

//  ┌───────────────────────────────────────────────────────────────────────────────────┐
//  │  FORMAT FOR TRANSPORTS.                                                           │
//  └───────────────────────────────────────────────────────────────────────────────────┘

//  ──[ FORMAT FILE. ]───────────────────────────────────────────────────────────────────
const FORMAT_FILE = combine(
  json(info => {
    const { timestamp, label, level, message } = info;
    return `${timestamp} ${level} ${label} ${message}`;
  }),
);

const FORMAT_CONSOLE = combine(
  colorize({ all: true }),
  printf(info => {
    const { timestamp, label, level, message, ...args } = info;
    return Object.keys(args).length
      ? `${timestamp} ${label} ${level}: ${message}:\n${JSON.stringify(args, null, 2)}`
      : `${timestamp} ${label} ${level}: ${message}`;
  }),
);

//  ┌───────────────────────────────────────────────────────────────────────────────────┐
//  │  FORMAT TO TRANSPORTS.                                                            │
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
      format: FORMAT_CONSOLE,
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
      filename: FILE_ERROR,
      format: FORMAT_FILE,
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
      filename: FILE_INFO,
      format: FORMAT_FILE,
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
