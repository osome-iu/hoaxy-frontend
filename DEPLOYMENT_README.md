# Deployment

## Summary

If changes to the Hoaxy interface are made, the updates need to be deployed before they will appear on the live site.

General changes to the functionality of the interface should be made to the `master` git branch and then merged into this `deployment` branch.

Changes specific to the live Branded Hoaxy Website at <http://hoaxy.iuni.iu.edu> can and should be made directly to this `deployment` branch.  This includes updates to the FAQ or changes to the Hoaxy or IU branding not found in the generic version.

## Instructions

### Method 1 - Updating directly on `carl`

1) Log into `carl` using the truthy user.
2) cd to the repository: `cd /u/truthy/code/hoaxy-frontend`
3) Confirm that you are on the development branch: `git branch` should display a list of branches and `development` should have a  `*` next to it as follows:

        [truthy@carl hoaxy-frontend]$ git branch
        * deployment
          master
        [truthy@carl hoaxy-frontend]$
4) If not on `deployment` branch, switch branch to deployment using `git checkout deployment`
5) Make changes using your favorite editor (e.g. `nano frontend/faq.html`).  Save your work.
6) Commit changes (e.g. `git commit -a -m 'Updates FAQ'`)
7) Push the changes to github: `git push origin deployment`
8) Run the deployment script: `./deploy_website.sh`
9) Confirm the website was successfully updated.
10) If successful, celebrate.
11) If not successful, **Don't panic** and contact a developer.

### Method 2 - Updating on github.com

1) Log into github.com
2) Go to the deployment branch of the frontend repository: <https://github.com/IUNetSci/hoaxy-frontend/tree/deployment>
3) Open a file that you want to edit.
4) Using the pencil icon at the top of the code listing to "Edit this file"
5) Make changes to the file.
6) Add a commit message and make sure to select the radio button for "commit directly to the `deployment` branch
7) Click "Commit changes" to commit the changes.
8) Log into `carl` as the truthy user using your favorite SSH terminal
9) cd to the repository: `cd /u/truthy/code/hoaxy-frontend`
10) Confirm that you are on the development branch: `git branch` should display a list of branches and `development` should have a  `*` next to it as follows:

        [truthy@carl hoaxy-frontend]$ git branch
        * deployment
          master
        [truthy@carl hoaxy-frontend]$
11) If not on `deployment` branch, switch branch to deployment using `git checkout deployment`
12) Pull changes from the github repo: `git pull origin deployment`
13) Run the deployment script: `./deploy_website.sh`
14) Confirm the website was successfully updated.
15) If successful, celebrate.
16) If not successful, **Don't panic** and contact a developer.

### Method 3 - Updating using a local repo

**This method assumes you already have a local development environment configured and the repo cloned to your local environment.**

1) Confirm that you are on the `deployment` branch
2) If not on `deployment` branch, switch branch to deployment (e.g. `git checkout deployment`)
3) Pull any remote changes to sync your repo with the latest updates in github:  `git pull origin deployment`
3) Make your updates, save your files, commit your changes.
4) Push your changes to the github repo: `git push origin deployment`
5) Log into `carl` as the truthy user using your favorite SSH terminal
6) cd to the repository: `cd /u/truthy/code/hoaxy-frontend`
7) Confirm that you are on the development branch: `git branch` should display a list of branches and `development` should have a  `*` next to it as follows:

        [truthy@carl hoaxy-frontend]$ git branch
        * deployment
          master
        [truthy@carl hoaxy-frontend]$
8) If not on `deployment` branch, switch branch to deployment using `git checkout deployment`
9) Pull changes from the github repo: `git pull origin deployment`
10) Run the deployment script: `./deploy_website.sh`
11) Confirm the website was successfully updated.
12) If successful, celebrate.
13) If not successful, **Don't panic** and contact a developer.
