var pg = require( 'pg' );
var connectionString = 'postgres://localhost/passport';
var fs = require( 'fs' );

var getUserSql = fs.readFileSync( './sql/getUser.sql', 'utf8' );

var createUserSql =
fs.readFileSync('./sql/createUser.sql', 'utf8' );

function runQuery( query, parameters ) {
  return new Promise ( function ( resolve, reject ) {
    pg.connect( connectionString, function (err, client, done ) {
      if ( err ) {
        done();
        reject( err );
        return;
      }
      client.query(query, parameters, function( err, results ) {
        done();
        if(err){
          reject();
          return;
        }
        resolve ( results );
      });
    });
  });
}

function getUser( username, password ){
  return runQuery ( getUserSql, [username, password]);
}

function createUser ( username, password ) {
  return runQuery( createUserSql, [username, password] );
}

module.exports = {
  login: {
    create: createUser,
    read: getUser
  }
};
