const client = require('prom-client');

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'appbtp_' });

const httpRequestDuration = new client.Histogram({
  name: 'appbtp_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});

const apiRequestsTotal = new client.Counter({
  name: 'appbtp_api_requests_total',
  help: 'Total number of API requests',
  labelNames: ['method', 'route', 'status_code']
});

const apiErrorsTotal = new client.Counter({
  name: 'appbtp_api_errors_total',
  help: 'Total number of API errors',
  labelNames: ['method', 'route', 'status_code']
});

const loginSuccessTotal = new client.Counter({
  name: 'appbtp_login_success_total',
  help: 'Total successful logins'
});

const loginFailedTotal = new client.Counter({
  name: 'appbtp_login_failed_total',
  help: 'Total failed logins'
});

const photoUploadSuccessTotal = new client.Counter({
  name: 'appbtp_photo_upload_success_total',
  help: 'Total successful photo uploads'
});

const photoUploadFailedTotal = new client.Counter({
  name: 'appbtp_photo_upload_failed_total',
  help: 'Total failed photo uploads'
});

const pdfGeneratedTotal = new client.Counter({
  name: 'appbtp_pdf_generated_total',
  help: 'Total PDFs generated'
});

const pdfGenerationDuration = new client.Histogram({
  name: 'appbtp_pdf_generation_duration_seconds',
  help: 'PDF generation duration in seconds',
  buckets: [0.5, 1, 2, 5, 10, 30, 60]
});

module.exports = {
  client,
  httpRequestDuration,
  apiRequestsTotal,
  apiErrorsTotal,
  loginSuccessTotal,
  loginFailedTotal,
  photoUploadSuccessTotal,
  photoUploadFailedTotal,
  pdfGeneratedTotal,
  pdfGenerationDuration
};
