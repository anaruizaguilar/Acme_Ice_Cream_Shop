// imports here for express and pg
const pg = require('pg');
const express = require('express');
const app = express();

const client = new pg.Client(process.env.DATABASE_URL || 'postgress://localhost/the_acme_ice_cream_shop_db');

// static routes here (you only need these for deployment)
app.use(express.json());
app.use(require('morgan')('dev'));
app.post('/api/flavors', async (req, res, next) => {
    try {
        const SQL = `
            INSERT INTO flavors(name, is_favorite)
            VALUES($1, $2)
            RETURNING *;
            `;
        const response = await client.query(SQL, [req.body.name, req.body.is_favorite]);
        res.send(response.rows[0]);
    } catch (error) {
        next(error);
    }
});
app.get('/api/flavors', async (req, res, next) => {
    try {
        const SQL = `SELECT * FROM flavors;`;
        const response = await client.query(SQL);
        res.send(response.rows);
    } catch (error) {
        next(error);
    }
});
app.put('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `
            UPDATE flavors
            SET name=$1, is_favorite=$2, updated_at=now()
            WHERE id=$3
            RETURNING *;
            `;
        const response = await client.query(SQL, [req.body.name, req.body.is_favorite, req.params.id]);
        res.send(response.rows[0]);
    } catch (error) {
        next(error);
    }
});
app.delete('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `
            DELETE FROM flavors
            WHERE id=$1
            `;
        const response = client.query(SQL, [req.params.id]);
        res.sendStatus(204);
    } catch (error) {
        next(error);
    }
});

// create your init function
const init = async () => {
    await client.connect();
    console.log('connected to database');
    let SQL = `
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        is_favorite BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
    )`;
    await client.query(SQL);
    console.log('tables created');
    SQL = `
    INSERT INTO flavors(name, is_favorite) VALUES('cherry', FALSE);
    INSERT INTO flavors(name, is_favorite) VALUES('redbull', FALSE);
    INSERT INTO flavors(name, is_favorite) VALUES('honeydew', TRUE);
    INSERT INTO flavors(name, is_favorite) VALUES('dark chocolate', FALSE);
    INSERT INTO flavors(name, is_favorite) VALUES('regret', FALSE);
    `;
    await client.query(SQL);
    console.log('data seeded');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`App listening in port ${PORT}`);
    })
}
// init function invocation
 init();