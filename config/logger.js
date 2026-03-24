import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Only errors
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    
    // All logs
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ]
});

// Console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;