// list_users.js - run with node list_users.js
const mongoose = require('mongoose');
const connectDB = require('./db');
const { User } = require('./CombinedModel');

(async () => {
  try {
    await connectDB();
    console.log('Liste des utilisateurs dans la base de donnees:');
    console.log('=' .repeat(50));
    
    const users = await User.find({}).select('-salt -hash');
    
    if (users.length === 0) {
      console.log('Aucun utilisateur trouve dans la base de donnees');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role || 'user'}`);
        console.log(`   Cree: ${user.createdAt || 'Non defini'}`);
        console.log('   ' + '-'.repeat(40));
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
  }
})();