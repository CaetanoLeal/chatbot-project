CREATE OR REPLACE FUNCTION fn_ret_upper(TEXT) RETURNS TEXT
AS 'SELECT TRANSLATE(UPPER($1)
									  ,TEXT ''áéíóúàèìòùãõâêîôôäëïöüç''
										,TEXT ''ÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÄËÏÖÜÇ'')' 
LANGUAGE SQL STRICT;
