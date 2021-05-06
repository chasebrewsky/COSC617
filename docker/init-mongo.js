// Create user in the development database.
db.createUser({
  user: 'slacklord',
  pwd: 'slacklord',
  roles: [
    {role: 'readWrite', db: 'slacklord'},
  ],
})
