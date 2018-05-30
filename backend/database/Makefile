.PHONY: test createDB createTB insertData dropDB

test: createDB createTB

createDB:
	psql -U postgres -f CreateDatabaseScript.sql

createTB:
	psql -U postgres -f CreateTablesScript.sql -d botometer

createFeedbackTB:
	psql -U postgres -f FeedbackTableCreation.sql -d botometer

insertData:
	psql -U postgres -f InitialBasicDataInsertionScript.sql -d botometer

dropDB:
	dropdb -U postgres "botometer"
