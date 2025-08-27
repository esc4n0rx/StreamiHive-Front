export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: any;
}

export interface NetworkLogData {
  url: string;
  method: string;
  status?: number;
  duration?: number;
  requestId?: string;
  userAgent?: string;
  connectionType?: string;
  onlineStatus?: boolean;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage(level, message, context);
    
    // Always log to console in development, only errors in production
    if (this.isDevelopment || level === 'error') {
      console[level === 'debug' ? 'log' : level](formattedMessage);
    }

    // Send to external logging service in production
    if (!this.isDevelopment && level === 'error') {
      this.sendToLoggingService(level, message, context);
    }
  }

  private sendToLoggingService(level: LogLevel, message: string, context?: LogContext): void {
    try {
      // In a real app, this would send to services like Sentry, LogRocket, etc.
      // For now, we'll just store in localStorage for debugging
      const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        context,
        userAgent: navigator?.userAgent,
        url: window?.location.href,
      };

      const existingLogs = JSON.parse(localStorage.getItem('streamhive_error_logs') || '[]');
      existingLogs.push(logEntry);
      
      // Keep only last 50 error logs
      const recentLogs = existingLogs.slice(-50);
      localStorage.setItem('streamhive_error_logs', JSON.stringify(recentLogs));
    } catch (error) {
      console.error('Failed to save error log:', error);
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext): void {
    this.log('error', message, context);
  }

  networkRequest(data: NetworkLogData): void {
    this.info('Network Request', data);
  }

  networkResponse(data: NetworkLogData): void {
    const level = data.status && data.status >= 400 ? 'error' : 'info';
    this.log(level, 'Network Response', data);
  }

  authEvent(event: string, context?: LogContext): void {
    this.info(`Auth Event: ${event}`, context);
  }

  // Get stored error logs for debugging
  getErrorLogs(): any[] {
    try {
      return JSON.parse(localStorage.getItem('streamhive_error_logs') || '[]');
    } catch {
      return [];
    }
  }

  clearErrorLogs(): void {
    localStorage.removeItem('streamhive_error_logs');
  }
}

export const logger = new Logger();