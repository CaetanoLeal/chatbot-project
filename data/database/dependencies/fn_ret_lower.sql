CREATE OR REPLACE FUNCTION fn_ret_lower(TEXT) RETURNS TEXT
AS 'SELECT TRANSLATE(LOWER($1)
									  ,TEXT ''ÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÄËÏÖÜÇ''
										,TEXT ''áéíóúàèìòùãõâêîôôäëïöüç'')' 
LANGUAGE SQL STRICT;