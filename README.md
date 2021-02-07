# COSC 617 Project

This will be the repository our group will use for our group project.

The current code in here is just an express app created with `express-generator` with some minor tweaks so that it uses some current features of the newest JavaScript spec, such as using `import` and `export` instead of `require('library')` and `module.exports = value`.

Everyone should first create a github account if you don't have one already. When you do, send me your info and I'll add you onto the project so you can push your own branches to this repo directly instead of having to fork it.

After that, everyone will have to clone this repo onto their machines. Make sure in your terminal that you are in a directory you want to clone the project to, then run either these two commands:

```
git clone https://github.com/chasebrewsky/COSC617.git
git clone git@github.com:chasebrewsky/COSC617.git
```

The first one will authenticate through HTTPS, and the second will authenticate through SSH if you have SSH keys setup. Authenticating through HTTPS is the easier of the two, but if you want to authenticate through SSH and are having problems let me know.

## First Task

The first thing we have to do is get used to the git workflow we'll use for this project. The workflow is very simple: nobody will be able to push directly to master. This prevents a lot of headaches from accidental pushes that have conflicts with the base branch. What we'll do instead is utilize pull requests to merge in code. This has the added benefit of being able to do a code review before merging in changes. 

These are the steps that should be taken when developing and pushing up code for pull requests:

1. On your local machine, make a custom branch off of the master branch named after the feature you're adding. If you were adding authentication you might name it `authentication`. This is created by running `git checkout -b authentication`.
2. Add the feature implementations on this branch. When the feature is done and you're ready to push, you first have to make sure you have the latest changes from the remote master branch. The quickest way to do this is by merging the remote master branch directly into your development branch: `git fetch && git merge origin/master`. This may cause some conflicts in your code you will have to resolve, so be aware of that.
3. Push your new branch onto a new remote branch using `git push -u origin authentication`. The last word in that command should be the same name as the branch you originally created. In this case it's `authentication`.
4. You should now see your branch present in github. At this point, you can go into the pull requests tab and click create pull request. You'll choose the branch you created as the source branch, and the master branch as the target branch. This will create a pull request that will highlight all the different changes between the two branches for review. I will check the changes to see if they're okay to merge. If they are, I'll hit the merge button, and the changes will be reflected in the master branch. If they aren't, you just have to make the required changes onto your local branch and hit `git push`. This will update the pull request automatically with those changes.

Using this workflow, add your names to the `views/index.ejs` template where it says INSERT HERE. I'll review and merge them using the pull request. If you have any questions let me know.
