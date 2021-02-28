# Slacklord

This will be the repository our group will use for our group project.

The current code in here is just an express app created with `express-generator`. We will be sticking to the CommonJS import system as the new ES6 imports were only recently added in Node v13, and most tutorials are written using them.

If anyone accidentally deletes the project from their computer, just run the following commands.

```
git clone https://github.com/chasebrewsky/COSC617.git
git clone git@github.com:chasebrewsky/COSC617.git
```

The first one will authenticate through HTTPS, and the second will authenticate through SSH if you have SSH keys setup. Authenticating through HTTPS is the easier of the two, but if you want to authenticate through SSH and are having problems let me know.

## Git Workflow

All new code to be merged into master must first go through a pull request. The steps to do that are as follows:

1. On your local machine, make a custom branch off of the master branch named after the feature you're adding. This is created by running `git checkout -b branch` where `branch` is the name of the branch you wish to make. Usually `git checkout branch` switches you to a different branch called `branch`, but when you add the `-b` flag it creates the branch before switching over to it. 
2. Perform the code modifications for the feature on this branch. When you're done, make sure to `git add .` to add your changes to the current staged changes for your branch, then run `git commit -m "Performed changes for feature"` where `"Performed changes for feature"` is a short description of the changes you made.
3. Before pushing this commit and new branch up to the remote, you first have to make sure it doesn't conflict with the current master branch. The quickest way to do this is by merging the remote master branch directly into your development branch: `git fetch && git merge origin/master`. This may cause some conflicts in your code you will have to resolve, so be aware of that.
3. Push your new branch onto a new remote branch using `git push -u origin branch` where `branch` is the branch you wish to push up.
4. You should now see your branch present in github. At this point, you can go into the pull requests tab and click create pull request. You'll choose the branch you created as the source branch, and the master branch as the target branch. This will create a pull request that will highlight all the different changes between the two branches for review. I will check the changes to see if they're okay to merge. If they are, I'll hit the merge button, and the changes will be reflected in the master branch. If they aren't, you just have to make the required changes onto your local branch and hit `git push`. This will update the pull request automatically with those changes.

## Structure

Currently the project contains the following structure:

* `server`: Express server code.
    * `server/bin`: Executable javascript code for the express application. Currently only has code that starts an express server.
    * `server/models`: Mongoose models that represent data in the MongoDB database.
    * `server/public`: Static assets the server provides to the browser, such as CSS and JS files.
    * `server/routes`: ExpressJS routers for different views. This should be used for creating new views in the application.
    * `server/shared`: Shared code between multiple modules of the express app.
        * `server/shared/config`: Global configuration parameters for the app.
        * `server/shared/db`: MongoDB database connection.
        * `server/shared/logger`: Application logger that uses pino.
    * `server/views`: EJS templates that render HTML pages.
    * `server/app.js`: File that contains the express application object. Any new middleware 
* `client`: React code (once we start this part).


## External Services

We will be using docker compose to spin up local instances of external services, like MongoDB, for use during development. This will help us from stepping on each others toes while creating new features for the application and allows us to tear down and setup the application without having to worry about messing up local or remote machines.

In order to setup the project, just run the following command at the root of this project:

```
$ docker-compose up -d
```

This will setup a MongoDB server on localhost at port 27017 with a database and user named slackord.

## Running the server

After the external service is setup, the server can be started by running `npm start`. This should start a server at `localhost:3000` that's already connected to MongoDB.
