import pg from 'pg';

const pool = new pg.Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'postgres',
  database: 'employee',
  port: 5432,
});

pool.connect(function(err) {
  if (err) {
    console.log('error connecting to db', err);
  } else {
    console.log('connected to db');
  }
})

export default pool;