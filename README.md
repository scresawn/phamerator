# phamerator

phamerator.org meteor application for web and (eventually) mobile devices

Install meteor by following the instructions at https://meteor.com
* `cd phamerator`
* `meteor`

Create a MongoDB index on the "Genomes" collection.
* With meteor running, open a new terminal in the phamerator subdirectory
* `meteor mongo`
* `use meteor`
* `db.genomes.createIndex({cluster:1});`

The name "Phamerator" is &copy; Steven Cresawn, Ph.D. 2006-2020. All rights reserved.
