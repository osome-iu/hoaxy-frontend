#!/bin/bash
chgrp -R truthy frontend &&
chmod -R a+r,g+rw frontend &&
rsync -r frontend/ /home/data/www/hoaxy-website &&
echo "Site is updated." &&
echo "Don't forget to commit and push any changes made on the server."

