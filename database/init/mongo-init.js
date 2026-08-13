db = db.getSiblingDB('appbtp');

db.createUser({
  user: 'appbtp',
  pwd: 'appbtp123',
  roles: [
    { role: 'readWrite', db: 'appbtp' },
    { role: 'dbAdmin', db: 'appbtp' }
  ]
});

print('Database user created successfully');
