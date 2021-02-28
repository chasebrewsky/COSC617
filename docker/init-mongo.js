// Create user in the development database.
db.createUser({
  user: 'slackord',
  pwd: 'slackord',
  roles: [
    {role: 'readWrite', db: 'slackord'},
  ],
})
