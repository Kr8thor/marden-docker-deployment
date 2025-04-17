@echo off
echo Building the project...
npm run build

if %ERRORLEVEL% neq 0 (
  echo Build failed. Exiting.
  exit /b 1
)

echo Creating tarball of the dist directory...
tar -czf dist.tar.gz -C dist .

echo Uploading to mardenseo.com...
scp dist.tar.gz mardenseo@mardenseo.com:/tmp/

echo Extracting files on the server...
ssh mardenseo@mardenseo.com "mkdir -p /var/www/audit.mardenseo.com && rm -rf /var/www/audit.mardenseo.com/* && tar -xzf /tmp/dist.tar.gz -C /var/www/audit.mardenseo.com && rm /tmp/dist.tar.gz"

echo Deployment completed successfully.
echo Your application is now available at http://audit.mardenseo.com
