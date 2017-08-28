.PHONY: test createDB createTB insertData dropDB

test: createDB createTB insertData

createDB:
	psql -U postgres -f CreateDatabaseScript.sql

createTB:
	psql -U postgres -f CreateTablesScript.sql -d botbase

insertData:
	psql -U postgres -f InitialBasicDataInsertionScript.sql -d botbase

dropDB:
	dropdb -U postgres "botbase"
