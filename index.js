const pg = require('pg')
const express = require('express')
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/flavors')
const app = express()
app.use(express.json())
app.use(require('morgan')('dev'))

app.use(express.json());
app.use(require('morgan')('dev'));

//POST
app.post('/api/flavors', async (req, res, next) => {
    try{
        const { name, is_favorite } = req.body;
        const response = await client.query("INSERT INTO flavors (name,is_favorite) VALUES ($1, $2)", [name, is_favorite]);
        res.json(`succesfully added name and is_favorite: ${name} ${is_favorite}`);
    }
    catch{(ex)
        next(ex)
    }
});

//GET
app.get('/api/flavors', async (req, res, next) => {
    try{
        const SQL = `SELECT * from flavors ORDER BY created_at DESC;`;
        const response = await client.query(SQL);
        res.send(response.rows);
    }
    catch(ex){
        next(ex);
    }
});

//GET SINGLE FLAVOR
app.get('/api/flavors/:id', async (req, res, next) => {
    try{
        const { id } = req.params;
        const SQL = `SELECT * from flavors WHERE id = $1;`;
        const response = await client.query(SQL,[id]);
        res.send(response.rows);
    }
    catch(ex){
        next(ex);
    }
});

//PUT
app.put('/api/flavors/:id', async (req, res, next) => {
    try{
        const { id } = req.params;
        const {name, is_favorite} = req.body;
        const response = await client.query("UPDATE flavors SET name=$1,is_favorite=$2,updated_at=now() WHERE id = $3 RETURNING *", [name, is_favorite, id]);
        res.json(`succesfully updated flavors: ${id}`);
        //res.send(response.rows[0])
    }
    catch(ex){
        next(ex)
    }
});

app.delete('/api/flavors/:id', async (req, res, next) => {
    try{
        const { id } = req.params;
        const response = await client.query("DELETE FROM flavors WHERE id = $1", [id]);
        res.json(`succesfully deleted flavors: ${id}`);
    }
    catch(ex){
        next(ex)
    }
});

const init = async () => {
    await client.connect()
    console.log('connected to database');
    let SQL = `DROP TABLE IF EXISTS flavors;
                CREATE TABLE flavors(
                    id SERIAL PRIMARY KEY,
                    created_at TIMESTAMP DEFAULT now(),
                    updated_at TIMESTAMP DEFAULT now(),
                    is_favorite BOOLEAN DEFAULT FALSE NOT NULL,
                    name VARCHAR(255) NOT NULL
                );`
    await client.query(SQL)
    console.log('tables creatd')
    SQL = `INSERT INTO flavors(name, is_favorite) VALUES('Vanilla', false);
            INSERT INTO flavors(name, is_favorite) VALUES('Choco', false);
            INSERT INTO flavors(name, is_favorite) VALUES('Cookies and Cream', true);`
    await client.query(SQL)
    console.log('data seed')
    const port = process.env.PORT || 3000
    app.listen(port, () => console.log(`listening on port ${port}`))
};

init()