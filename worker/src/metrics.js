const client = require('prom-client');

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'appbtp_worker_' });

const pdfJobsTotal = new client.Counter({
  name: 'appbtp_pdf_jobs_total',
  help: 'Total PDF generation jobs',
  labelNames: ['status']
});

const pdfJobsFailed = new client.Counter({
  name: 'appbtp_pdf_jobs_failed',
  help: 'Total failed PDF generation jobs'
});

const pdfProcessingTime = new client.Histogram({
  name: 'appbtp_pdf_processing_time_seconds',
  help: 'PDF processing time in seconds',
  buckets: [0.5, 1, 2, 5, 10, 30, 60]
});

module.exports = { client, pdfJobsTotal, pdfJobsFailed, pdfProcessingTime };
