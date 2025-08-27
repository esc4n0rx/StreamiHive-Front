import { logger } from './logger';

export interface NetworkDiagnostics {
  isOnline: boolean;
  connectionType: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

export interface ConnectivityTest {
  endpoint: string;
  reachable: boolean;
  responseTime?: number;
  error?: string;
}

export class NetworkUtils {
  static getNetworkDiagnostics(): NetworkDiagnostics {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    return {
      isOnline: navigator.onLine,
      connectionType: connection?.type || 'unknown',
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
      saveData: connection?.saveData,
    };
  }

  static async testConnectivity(endpoints: string[] = []): Promise<ConnectivityTest[]> {
    const defaultEndpoints = [
      'https://api.streamhive.icu/health',
      'https://httpbin.org/status/200',
      'https://www.google.com/favicon.ico',
    ];

    const testEndpoints = endpoints.length > 0 ? endpoints : defaultEndpoints;
    const results: ConnectivityTest[] = [];

    for (const endpoint of testEndpoints) {
      const startTime = Date.now();
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(endpoint, {
          method: 'GET',
          mode: 'no-cors',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        results.push({
          endpoint,
          reachable: true,
          responseTime,
        });

        logger.debug('Connectivity test passed', {
          endpoint,
          responseTime,
        });

      } catch (error) {
        const responseTime = Date.now() - startTime;
        
        results.push({
          endpoint,
          reachable: false,
          responseTime,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        logger.warn('Connectivity test failed', {
          endpoint,
          responseTime,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  static async diagnoseNetworkIssue(): Promise<{
    summary: string;
    details: NetworkDiagnostics;
    connectivityTests: ConnectivityTest[];
    recommendations: string[];
  }> {
    logger.info('Starting network diagnostics');

    const details = this.getNetworkDiagnostics();
    const connectivityTests = await this.testConnectivity();
    
    const recommendations: string[] = [];
    let summary = 'Network appears to be working normally';

    // Analyze results
    if (!details.isOnline) {
      summary = 'Device is offline';
      recommendations.push('Check your internet connection');
    } else if (connectivityTests.every(test => !test.reachable)) {
      summary = 'No external connectivity';
      recommendations.push('Check firewall settings');
      recommendations.push('Try using a different network');
    } else if (connectivityTests.some(test => test.endpoint.includes('streamhive') && !test.reachable)) {
      summary = 'StreamHive API is unreachable';
      recommendations.push('StreamHive servers may be down');
      recommendations.push('Try again in a few minutes');
    } else if (details.effectiveType && ['slow-2g', '2g'].includes(details.effectiveType)) {
      summary = 'Slow internet connection detected';
      recommendations.push('Consider switching to a faster connection');
    }

    // Check for service worker interference
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      if (registrations.length > 0) {
        recommendations.push('Service worker detected - may be interfering with requests');
      }
    }

    logger.info('Network diagnostics completed', {
      summary,
      details,
      connectivityTestCount: connectivityTests.length,
      reachableCount: connectivityTests.filter(t => t.reachable).length,
    });

    return {
      summary,
      details,
      connectivityTests,
      recommendations,
    };
  }

  static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}