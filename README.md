# Phamerator overview

This source code powers the phamerator.org comparative bacteriophage genomics platform. The code is made available primarily for those who wish to help with development. If you want to use Phamerator to analyze the public Actinobacteriophage genome data set, you can stop reading these instructions and just head over to phamerator.org. Phamerator.org already hosts many data sets, and can host yours too. Hosted data sets can be public, shared with a team of users, or reserved just for you. For help with adding your own data set(s), please get in touch with us. Contact information is available at cresawnlab.org. 

## For developers:

Install meteor by following the instructions at https://meteor.com
* `cd phamerator`
* `meteor`

Create a MongoDB index on the "Genomes" collection.
* With meteor running, open a new terminal in the phamerator subdirectory
* `meteor mongo`
* `use meteor`
* `db.genomes.createIndex({cluster:1});`

The name "Phamerator" is &copy; Steven Cresawn, Ph.D. 2006-2020. All rights reserved.
