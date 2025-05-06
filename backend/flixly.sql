\echo 'Delete and recreate flixly db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE flixly;
CREATE DATABASE flixly;
\connect flixly

\i flixly-schema.sql


\echo 'Delete and recreate flixly_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE flixly_test;
CREATE DATABASE flixly_test;
\connect flixly_test

\i flixly-schema.sql
