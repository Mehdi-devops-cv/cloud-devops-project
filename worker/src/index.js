const amqp = require('amqplib');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const { client, pdfJobsTotal, pdfJobsFailed, pdfProcessingTime } = require('./metrics');
const logger = require('./logger');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://appbtp:appbtp123@localhost:27017/appbtp?authSource=admin';
const PDF_QUEUE = 'pdf_generation';

// Simple schema for the worker
const folderSchema = new mongoose.Schema({
  reportNumber: Number, chantierName: String, company: String,
  city: String, building: String, task: String, mission: String,
  startDate: Date, endDate: Date, userId: mongoose.Schema.Types.ObjectId, createdAt: Date
});

const folderPhotoSchema = new mongoose.Schema({
  folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder' },
  imageAvant: String, imageApres: String,
  userId: mongoose.Schema.Types.ObjectId, createdAt: Date
});

const pdfJobSchema = new mongoose.Schema({
  folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', required: true },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  pdfPath: String,
  error: String,
  createdAt: { type: Date, default: Date.now },
  completedAt: Date
});

const Folder = mongoose.model('Folder', folderSchema);
const FolderPhoto = mongoose.model('FolderPhoto', folderPhotoSchema);
const PdfJob = mongoose.model('PdfJob', pdfJobSchema);

async function generatePDF(job) {
  const startTime = Date.now();
  
  try {
    logger.info(`Processing PDF job for folder ${job.folderId}`);
    
    const folder = await Folder.findById(job.folderId);
    if (!folder) throw new Error(`Folder ${job.folderId} not found`);
    
    const photos = await FolderPhoto.find({ folderId: job.folderId });
    
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    
    doc.on('data', chunk => chunks.push(chunk));
    
    const pdfPath = `/tmp/rapport_${folder.reportNumber}_${Date.now()}.pdf`;
    const stream = require('fs').createWriteStream(pdfPath);
    doc.pipe(stream);
    
    // Header
    doc.fontSize(20).text('RAPPORT DE CHANTIER', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Rapport N°: ${folder.reportNumber}`);
    doc.text(`Mission: ${folder.chantierName}`);
    doc.text(`Entreprise: ${folder.company}`);
    doc.text(`Ville: ${folder.city}`);
    doc.text(`Batiment: ${folder.building}`);
    doc.text(`Tache: ${folder.task}`);
    doc.text(`Date debut: ${folder.startDate ? new Date(folder.startDate).toLocaleDateString('fr-FR') : 'N/A'}`);
    doc.text(`Date fin: ${folder.endDate ? new Date(folder.endDate).toLocaleDateString('fr-FR') : 'En cours'}`);
    doc.moveDown();
    
    // Photos section
    doc.fontSize(16).text('Photos');
    doc.moveDown();
    
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      doc.fontSize(12).text(`Photo ${i + 1}:`);
      doc.text(`  Avant: ${photo.imageAvant ? 'Disponible' : 'Non disponible'}`);
      doc.text(`  Apres: ${photo.imageApres ? 'Disponible' : 'Non disponible'}`);
      doc.moveDown(0.5);
    }
    
    // Footer
    doc.moveDown();
    doc.fontSize(10).text(`Genere le ${new Date().toLocaleDateString('fr-FR')} a ${new Date().toLocaleTimeString('fr-FR')}`);
    
    doc.end();
    
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
    
    const duration = (Date.now() - startTime) / 1000;
    pdfProcessingTime.observe(duration);
    pdfJobsTotal.inc({ status: 'completed' });
    
    await PdfJob.findByIdAndUpdate(job._id, {
      status: 'completed',
      pdfPath,
      completedAt: new Date()
    });
    
    logger.info(`PDF generated successfully: ${pdfPath} in ${duration}s`);
    
  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;
    pdfProcessingTime.observe(duration);
    pdfJobsFailed.inc();
    pdfJobsTotal.inc({ status: 'failed' });
    
    await PdfJob.findByIdAndUpdate(job._id, {
      status: 'failed',
      error: error.message,
      completedAt: new Date()
    });
    
    logger.error(`PDF generation failed: ${error.message}`);
  }
}

async function startWorker() {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB');
    
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    
    await channel.assertQueue(PDF_QUEUE, { durable: true });
    channel.prefetch(1);
    
    logger.info('Worker waiting for PDF generation messages...');
    
    channel.consume(PDF_QUEUE, async (msg) => {
      if (msg) {
        const jobData = JSON.parse(msg.content.toString());
        logger.info(`Received PDF job: ${JSON.stringify(jobData)}`);
        
        await generatePDF(jobData);
        channel.ack(msg);
      }
    });
    
  } catch (error) {
    logger.error(`Worker failed to start: ${error.message}`);
    process.exit(1);
  }
}

// Metrics server
async function startMetricsServer() {
  const http = require('http');
  const server = http.createServer(async (req, res) => {
    if (req.url === '/metrics') {
      res.setHeader('Content-Type', client.register.contentType);
      res.end(await client.register.metrics());
    } else if (req.url === '/health') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ status: 'healthy', service: 'worker' }));
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  
  const METRICS_PORT = process.env.METRICS_PORT || 9090;
  server.listen(METRICS_PORT, () => {
    logger.info(`Worker metrics server on port ${METRICS_PORT}`);
  });
}

startMetricsServer();
startWorker();
