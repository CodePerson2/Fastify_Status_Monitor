export const HEALTH_URLS = {
    auth:    {url: 'http://localhost:3001', dataEndpoint: '/analytics'},
    billing: {url: 'http://localhost:3002', dataEndpoint: '/billing'},
    notifications: {url: 'http://localhost:3003', dataEndpoint: '/notifications'},
    analytics: {url: 'http://localhost:3004', dataEndpoint: '/analytics'},
};

export const HEALTH_ENDPOINT = '/health';

export const WS_URL = 'ws://localhost:4000/ws';

export const MSG_TYPES = {
  WELCOME: 'welcome',
  INITIAL_SNAPSHOT: 'initialSnapshot',
  STATUS_UPDATE: 'statusUpdate',
};