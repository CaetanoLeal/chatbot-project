--------------------------------------------------------------------------------
--  PERMITE TRABALHAR COM UUID
--------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION public.uuid_equal_varchar(i UUID,s VARCHAR) 
RETURNS BOOLEAN AS 
	'SELECT CAST($1 AS VARCHAR) = $2'
LANGUAGE 'sql' VOLATILE 
COST 100;

CREATE OPERATOR public.=(PROCEDURE = "uuid_equal_varchar"
                        ,LEFTARG   = UUID
                        ,RIGHTARG  = VARCHAR);
												
--------------------------------------------------------------------------------
--  TRATA CARACTERE MAIÚSCULO / MINÚSCULO
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION maiusculas(text) RETURNS text AS '
   SELECT translate( upper($1),
          text ''áéíóúàèìòùãõâêîôôäëïöüç'',
          text ''ÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÄËÏÖÜÇ'')' 
LANGUAGE SQL STRICT;

SELECT maiusculas('à ação seqüência');

---
CREATE OR REPLACE FUNCTION minusculas(text) RETURNS text AS '
  SELECT translate( lower($1),
         text ''ÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÄËÏÖÜÇ'',
         text ''áéíóúàèìòùãõâêîôôäëïöüç'')' 
LANGUAGE SQL STRICT;

SELECT minusculas('À AÇÃO SEQÜÊNCIA');

--------------------------------------------------------------------------------
--  RETIRA ACENTUAÇÃO
--------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION retira_acentuacao(p_texto text)  
  RETURNS text AS  
 $BODY$  
 Select translate($1,  
 'áàâãäåaÁÂÃÄÅAÀéèêëeÉÈÊËìíîïìiÌÍÎÏÌIóôõöoòÒÓÔÕÖOùúûüuÙÚÛÜUçÇñÑýÝ',  
 'aaaaaaaAAAAAAAeeeeeEEEEiiiiiiIIIIIIooooooOOOOOOuuuuuUUUUUcCnNyY'   
  );  
 $BODY$  
 LANGUAGE sql VOLATILE  
 COST 100;  
 
SELECT retira_acentuacao('À AÇÃO SEQÜÊNCIA');
