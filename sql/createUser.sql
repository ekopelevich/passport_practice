INSERT INTO "login" values
  ($1, crypt($2, gen_salt('bf')));
