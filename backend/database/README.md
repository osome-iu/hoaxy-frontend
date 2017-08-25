# Hoaxy-Botometer Database
## Description
This project uses the PostgreSQL object relational database management system, whereby we have a botbase database containing a botscore table to be used by Hoaxy and BotOMeter.
## Set-up
1) Download and install PostgreSQL using the following guide depending on your operating system: http://postgresguide.com/setup/install.html
2) After connecting to your database server using a `postgres` user or another user of your choice which you have created, execute the `CreateDatabaseScript.sql` after altering the name of the user (default is `postgres`)
3) Connect to the newly created `botbase` database and execute the `CreateTablesScript.sql` script to create the proper table(s) and table properties
4) (Optional) Run the `InitialBasicDataInsertionScript.sql` script to insert some data into the table(s)