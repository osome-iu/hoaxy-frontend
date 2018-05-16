#!/bin/bash
chgrp -R truthy frontend &&
chmod -R a+r,g+rw frontend &&
rsync -r frontend/ /home/data/www/hoaxy-botometer &&
echo "Site is updated"
