# Setting Up GitHub Secrets for Railway Deployment

To make the GitHub Actions workflow deploy to Railway correctly, you need to add your Railway API token as a repository secret. Here's how:

## Steps to Add Railway Token as a GitHub Secret

1. Go to your GitHub repository at: https://github.com/Kr8thor/marden-docker-deployment

2. Click on "Settings" (tab near the top of the repository page)

3. In the left sidebar, click on "Secrets and variables" and then select "Actions"

4. Click on the "New repository secret" button

5. Enter the following information:
   - Name: `RAILWAY_TOKEN`
   - Secret: `02eb79ca-7c33-4c1b-ba86-fc3a61189046`

6. Click "Add secret"

Once you've added this secret, the GitHub Actions workflow will be able to authenticate with Railway and deploy your project automatically whenever you push to the main branch.

## Verify Deployment

After adding the secret:
1. Make a small change to any file in the repository
2. Commit and push the change
3. Go to the "Actions" tab in your GitHub repository to watch the workflow run
4. Once completed successfully, check your Railway dashboard to see the deployed project
