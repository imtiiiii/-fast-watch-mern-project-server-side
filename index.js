const express = require('express')
const app = express()
const cors = require('cors');

app.use(cors())
app.use(express.json())
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectID = require('mongodb').ObjectID
const port = process.env.PORT || 5000;


app.get("/", (req, res) => {
    res.send("server running");
});



// app.get("/test", (req, res) => {
//     console.log("hitting it");
//     res.send("test succesfull");
// })
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jcnea.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("fast-watch");
        const usersCollections = database.collection("users");
        const productsCollections = database.collection("products");
        const bookingsCollections = database.collection("bookings");
        const reviewsCollections = database.collection("reviews");

        // post to save users
        app.post('/users', async (req, res) => {
            // console.log(req.body.email);
            const doc = {
                email: req.body.email
            }
            const result = await usersCollections.insertOne(doc)
        });
        // --------------------------------------------------------------
        // get to get userdb
        app.get("/users", async (req, res) => {
            const email = req.query.email;
            const result = await usersCollections.findOne({ email: email })
            res.send(result)
        })
        app.get('/users/all', async (req, res) => {
            const cursor = usersCollections.find({})
            const result = await cursor.toArray()
            res.send(result)

        })

        // __________________
        // post to save products
        app.post('/products', async (req, res) => {
            // console.log(req.body);
            const result = await productsCollections.insertOne(req.body)
            res.send(result);
        });
        // ------------------------------------------------------
        // get to show products on server
        app.get("/products", async (req, res) => {
            const cursor = productsCollections.find({}).limit(6);
            const result = await cursor.toArray();
            res.send(result);

        })
        // --------------------------------------------
        // get to show all products in explore
        app.get("/products/explore", async (req, res) => {
            const cursor = productsCollections.find({})
            const result = await cursor.toArray();
            res.send(result);

        })
        // -----------------------------
        // get to find a single product
        app.get("/products/explore/:id", async (req, res) => {
            // console.log("hitting server")
            const id = req.params.id;
            console.log(id)
            const query = { _id: ObjectID(id) }
            const cursor = productsCollections.findOne(query)
            const result = await cursor
            console.log(result)

            res.send(result);

        })
        // ---------------------------------
        // post to store usesrs booking
        app.post("/bookings", async (req, res) => {
            const result = await bookingsCollections.insertOne(req.body);
            res.send(result)
        })
        // ______________________________________________
        // get to search for bookings
        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            // console.log(req.query)
            const cursor = bookingsCollections.find({ email: email })
            const result = await cursor.toArray();
            // console.log(result);
            res.send(result)
        })
        // -------------------------------------
        // get to show all bookings
        app.get('/bookings/all', async (req, res) => {
            const email = req.query.email;
            // console.log(req.query)
            const cursor = bookingsCollections.find()
            const result = await cursor.toArray();
            // console.log(result);
            res.send(result)
        })
        // ____________________________________
        // put to update the status
        app.put('/bookings/all', async (req, res) => {
            const { id, email, status } = req.body
            const filter = { productId: id, email: email };
            console.log(filter)
            const updateDoc = {
                $set: {
                    status: status
                }

            };
            const result = await bookingsCollections.updateOne(filter, updateDoc)
            console.log(result);
        })
        // ________________________________________
        // delete to delete from manage all users
        app.delete("/products/explore/:id", async (req, res) => {
            // console.log("hitting server")
            const id = req.params.id;
            // console.log(id)
            const query = { _id: ObjectID(id) }
            const result = await productsCollections.deleteOne(query);
            console.log(result)
            res.send(result);

        })
        // ________________________________
        // delete to delete from mybookings
        app.delete('/bookings/all', async (req, res) => {
            const id = req.query.id
            const query = { _id: ObjectID(id) }
            const result = await bookingsCollections.deleteOne(query);
        })

        // ____________________
        app.put("/users/all", async (req, res) => {
            const { email } = req.body;
            const filter = { email: email };
            const updateDoc = {
                $set: {
                    role: "admin"
                }
            }
            const result = await usersCollections.updateOne(filter, updateDoc);
            res.send(result)
        })
        app.post("/reviews", async (req, res) => {
            const result = await reviewsCollections.insertOne(req.body);
        })
        app.get("/reviews", async (req, res) => {
            const cursor = reviewsCollections.find()
            const result = await cursor.toArray();
            res.send(result)

        });
    } finally {

    }


}
run().catch(console.dir);
app.listen(port, () => {
    console.log("listening to port", port);
})