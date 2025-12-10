import pg from 'pg';

export const pool = new pg.Pool({
    user: "postgres",      
    host: "localhost",     
    password: "root",      
    database: "bdwm1612",  
    port: 5432             
});

