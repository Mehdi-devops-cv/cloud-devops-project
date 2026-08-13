const mongoose = require('mongoose');
const { City } = require('./CombinedModel');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

// 5 nouvelles villes à ajouter
const newCities = [
  { name: 'Lyon' },
  { name: 'Marseille' },
  { name: 'Toulouse' },
  { name: 'Nice' },
  { name: 'Nantes' }
];

async function addCities() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connexion a MongoDB reussie');

    for (const cityData of newCities) {
      const existingCity = await City.findOne({ name: cityData.name });
      
      if (existingCity) {
        console.log(`${cityData.name} existe deja`);
      } else {
        const city = new City(cityData);
        await city.save();
        console.log(`${cityData.name} ajoutee`);
      }
    }

    console.log('Toutes les villes ont ete traitees !');
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

addCities();
