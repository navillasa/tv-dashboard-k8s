import client from 'prom-client';

// Create a Registry to register the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'tv-dashboard-backend'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register]
});

export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status_code'],
  registers: [register]
});

export const tvShowsRequested = new client.Counter({
  name: 'tv_shows_requested_total',
  help: 'Total number of TV shows requested',
  labelNames: ['platform'],
  registers: [register]
});

export const externalApiRequests = new client.Counter({
  name: 'external_api_requests_total',
  help: 'Total number of external API requests',
  labelNames: ['api_name', 'status'],
  registers: [register]
});

export const externalApiDuration = new client.Histogram({
  name: 'external_api_duration_seconds',
  help: 'Duration of external API requests in seconds',
  labelNames: ['api_name'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register]
});

export const databaseConnections = new client.Gauge({
  name: 'database_connections_active',
  help: 'Number of active database connections',
  registers: [register]
});

export const showsInDatabase = new client.Gauge({
  name: 'tv_shows_in_database_total',
  help: 'Total number of TV shows in database',
  registers: [register]
});

// Export the register
export { register };
