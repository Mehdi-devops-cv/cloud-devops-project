const mongoose = require('mongoose');
const crypto = require('crypto');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://appbtp:appbtp123@localhost:27017/appbtp?authSource=admin';

// Schemas
const userSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true },
  salt: String, hash: String,
  role: { type: String, enum: ['user', 'admin', 'nettoyeur', 'hommeclé', 'pilote'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const citySchema = new mongoose.Schema({ name: { type: String, required: true } });
const buildingSchema = new mongoose.Schema({ name: { type: String, required: true } });

const noteSchema = new mongoose.Schema({
  city: String, building: String, task: String, floor: String, apartment: String,
  company: String, openTime: String, closedTime: String,
  selectedDate: Date, userId: mongoose.Schema.Types.ObjectId, createdAt: { type: Date, default: Date.now }
});

const constatationSchema = new mongoose.Schema({
  city: String, building: String, task: String, selectedDate: Date, userId: mongoose.Schema.Types.ObjectId,
  reportNumber: Number, chantierName: String, company: String,
  imageAvant: String, imageApres: String, floor: String, apartment: String,
  description: String, image: String, createdAt: { type: Date, default: Date.now }
});

const effectifSchema = new mongoose.Schema({
  city: String, building: String, task: String, floor: String, apartment: String,
  company: String, nombrePersonnes: Number, selectedDate: Date,
  userId: mongoose.Schema.Types.ObjectId, createdAt: { type: Date, default: Date.now }
});

const remarqueSchema = new mongoose.Schema({
  city: String, building: String, task: String, floor: String, apartment: String,
  description: String, image: String, selectedDate: Date,
  userId: mongoose.Schema.Types.ObjectId, createdAt: { type: Date, default: Date.now }
});

const folderSchema = new mongoose.Schema({
  reportNumber: Number, chantierName: String, company: String,
  city: String, building: String, task: String, mission: String,
  startDate: Date, endDate: Date, userId: mongoose.Schema.Types.ObjectId, createdAt: { type: Date, default: Date.now }
});

const folderPhotoSchema = new mongoose.Schema({
  folderId: mongoose.Schema.Types.ObjectId, imageAvant: String, imageApres: String,
  userId: mongoose.Schema.Types.ObjectId, createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const City = mongoose.model('City', citySchema);
const Building = mongoose.model('Building', buildingSchema);
const Note = mongoose.model('Note', noteSchema);
const Constatation = mongoose.model('Constatation', constatationSchema);
const Effectif = mongoose.model('Effectif', effectifSchema);
const Remarque = mongoose.model('Remarque', remarqueSchema);
const Folder = mongoose.model('Folder', folderSchema);
const FolderPhoto = mongoose.model('FolderPhoto', folderPhotoSchema);

function generateSaltAndHash(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

// Fake base64 placeholder image (1x1 red pixel PNG)
const FAKE_IMAGE = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB for seeding');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}), City.deleteMany({}), Building.deleteMany({}),
    Note.deleteMany({}), Constatation.deleteMany({}), Effectif.deleteMany({}),
    Remarque.deleteMany({}), Folder.deleteMany({}), FolderPhoto.deleteMany({})
  ]);
  console.log('Cleared existing data');

  // Create users
  const users = [];
  const userData = [
    { name: 'Admin BTP', email: 'admin@test.com', password: 'admin123', role: 'admin' },
    { name: 'Jean Dupont', email: 'maitre@test.com', password: 'maitre123', role: 'pilote' },
    { name: 'Pierre Martin', email: 'hommecle@test.com', password: 'homme123', role: 'hommeclé' },
    { name: 'Marie Curie', email: 'nettoyeur@test.com', password: 'nettoyeur123', role: 'nettoyeur' },
  ];

  for (const u of userData) {
    const { salt, hash } = generateSaltAndHash(u.password);
    const user = await new User({ name: u.name, email: u.email, salt, hash, role: u.role }).save();
    users.push(user);
    console.log(`Created user: ${u.email} (${u.role})`);
  }

  // Create cities
  const cityNames = ['Paris 17eme', 'Saint-Ouen-sur-Seine', 'Montfermeil', 'Lyon', 'Marseille', 'Toulouse'];
  const cities = [];
  for (const name of cityNames) {
    const city = await new City({ name }).save();
    cities.push(city);
  }
  console.log('Created cities');

  // Create buildings
  const buildingData = [
    { name: 'Batiment A', city: 'Paris 17eme' }, { name: 'Batiment B', city: 'Paris 17eme' },
    { name: 'Batiment Nord', city: 'Saint-Ouen-sur-Seine' }, { name: 'Batiment Sud', city: 'Saint-Ouen-sur-Seine' },
    { name: 'Residence Les Bosquets', city: 'Montfermeil' }, { name: 'Batiment Principal', city: 'Lyon' },
    { name: 'Immeuble Vieux-Port', city: 'Marseille' }, { name: 'Residence Capitole', city: 'Toulouse' },
  ];
  const buildings = [];
  for (const b of buildingData) {
    const building = await new Building(b).save();
    buildings.push(building);
  }
  console.log('Created buildings');

  // Create notes
  const tasks = ['Nettoyage', 'Remise en etat', 'Dechargement'];
  const floors = ['RDC', '1er', '2eme', '3eme', '4eme'];
  const apartments = ['101', '102', '103', '201', '202', '203', '301', '302'];
  const companies = ['BTP Services', 'CleanPro', 'Facility Plus', 'MultiClean'];

  for (let i = 0; i < 15; i++) {
    const building = buildings[Math.floor(Math.random() * buildings.length)];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    date.setHours(12, 0, 0, 0);
    
    await new Note({
      city: building.name.includes('Paris') ? 'Paris 17eme' : cities[i % cities.length].name,
      building: building.name, task: tasks[i % tasks.length],
      floor: floors[i % floors.length], apartment: apartments[i % apartments.length],
      company: companies[i % companies.length],
      openTime: '08:00', closedTime: i % 3 === 0 ? '17:00' : '',
      selectedDate: date, userId: users[Math.floor(Math.random() * users.length)]._id
    }).save();
  }
  console.log('Created 15 notes');

  // Create constatations (photo reports)
  for (let i = 0; i < 10; i++) {
    const building = buildings[Math.floor(Math.random() * buildings.length)];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    date.setHours(12, 0, 0, 0);
    
    await new Constatation({
      city: cities[i % cities.length].name, building: building.name,
      task: tasks[i % tasks.length], selectedDate: date,
      userId: users[Math.floor(Math.random() * 2) + 1]._id,
      reportNumber: i + 1, chantierName: `Chantier ${building.name}`,
      company: companies[i % companies.length],
      imageAvant: FAKE_IMAGE, imageApres: i % 2 === 0 ? FAKE_IMAGE : '',
      floor: floors[i % floors.length], apartment: apartments[i % apartments.length],
      description: `Constatation ${i + 1}: Etat des lieux du batiment ${building.name}`
    }).save();
  }
  console.log('Created 10 constatations');

  // Create effectifs
  for (let i = 0; i < 8; i++) {
    const building = buildings[Math.floor(Math.random() * buildings.length)];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 15));
    date.setHours(12, 0, 0, 0);
    
    await new Effectif({
      city: cities[i % cities.length].name, building: building.name,
      task: tasks[i % tasks.length], floor: floors[i % floors.length],
      apartment: apartments[i % apartments.length], company: companies[i % companies.length],
      nombrePersonnes: Math.floor(Math.random() * 10) + 1,
      selectedDate: date, userId: users[Math.floor(Math.random() * users.length)]._id
    }).save();
  }
  console.log('Created 8 effectifs');

  // Create remarques (pilote only)
  for (let i = 0; i < 6; i++) {
    const building = buildings[Math.floor(Math.random() * buildings.length)];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 20));
    date.setHours(12, 0, 0, 0);
    
    await new Remarque({
      city: cities[i % cities.length].name, building: building.name,
      task: tasks[i % tasks.length], floor: floors[i % floors.length],
      apartment: apartments[i % apartments.length],
      description: `Remarque ${i + 1}: Points a surveiller sur le chantier`,
      image: FAKE_IMAGE, selectedDate: date,
      userId: users[1]._id // pilote
    }).save();
  }
  console.log('Created 6 remarques');

  // Create folders and photos
  for (let i = 0; i < 4; i++) {
    const building = buildings[i % buildings.length];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    date.setHours(12, 0, 0, 0);
    
    const folder = await new Folder({
      reportNumber: i + 1, chantierName: `Mission ${building.name}`,
      company: companies[i % companies.length],
      city: cities[i % cities.length].name, building: building.name,
      task: tasks[i % tasks.length], mission: `Rapport photo ${building.name}`,
      startDate: date, userId: users[1]._id
    }).save();
    
    // Add photos to folder
    for (let j = 0; j < 3; j++) {
      await new FolderPhoto({
        folderId: folder._id,
        imageAvant: FAKE_IMAGE,
        imageApres: FAKE_IMAGE,
        userId: users[1]._id
      }).save();
    }
  }
  console.log('Created 4 folders with 12 photos');

  console.log('\n=== SEED COMPLETE ===');
  console.log('Test accounts:');
  console.log('  admin@test.com / admin123 (Admin)');
  console.log('  maitre@test.com / maitre123 (Pilote/Maitre)');
  console.log('  hommecle@test.com / homme123 (Homme Cle)');
  console.log('  nettoyeur@test.com / nettoyeur123 (Nettoyeur)');
  
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
