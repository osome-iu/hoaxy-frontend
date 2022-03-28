#!/bin/bash
chgrp -R truthy frontend &&
chmod -R a+r,g+rw frontend &&
rsync -r frontend/  /home/data/www/DocumentRoot/hoaxy.osome.iu.edu &&
echo "Site is updated." &&
echo "Don't forget to commit and push any changes made on the server."
