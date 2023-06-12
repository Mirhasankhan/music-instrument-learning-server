const express = require('express');
const app = express()
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const port = process.env.PORT || 5000;

// middlewares
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://TuneTutor:DhjSC6p1oHugP2JR@cluster0.cpvrkgd.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        const usersCollection = client.db('users').collection('user')
        const classCollection = client.db('users').collection('class')
        const SelectedClassCollection = client.db('users').collection('selected')

        // All user apis
        app.get('/users', async (req, res) => {
            let instructors = {}
            if (req.query?.role) {
                instructors = { role: req.query.role }
            }
            const result = await usersCollection.find(instructors).toArray()
            res.send(result)
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exists' })
            }
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })

        app.patch('/users/instructor/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updatedUser = {
                $set: {
                    role: 'instructor'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedUser)
            res.send(result)
        })
       
        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updatedUser = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedUser)
            res.send(result)
        })

        // add class api
        app.get('/classes', async (req, res) => {
            let approved = {}
            if (req.query.status) {
                approved = { status: req.query.status }
            }
            const result = await classCollection.find(approved).toArray()
            res.send(result)
        })

        app.patch('/classes/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    status: 'approved'
                }
            }
            const result = await classCollection.updateOne(filter, updatedDoc, options)
            res.send(result)
        })
        app.patch('/class/:id', async (req, res) => {
            const id = req.params.id;
            const body = req.body
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    feedback: body.feedback
                }
            }
            const result = await classCollection.updateOne(filter, updatedDoc, options)
            res.send(result)
        })
        app.patch('/class/denied/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    status: 'denied'
                }
            }
            const result = await classCollection.updateOne(filter, updatedDoc, options)
            res.send(result)
        })

        app.get('/myClasses', async (req, res) => {
            let email = {}
            if (req.query.email) {
                email = { email: req.query.email }
            }
            const result = await classCollection.find(email).toArray()
            res.send(result)
        })

        app.put('/myClasses/:id', async(req, res)=>{
            const id = req.params.id
            const body = req.body;
            const filter = {_id: new ObjectId(id)}
            const options = { upsert: true };
            const updatedClass = {
                $set: {
                    class: body.class,
                    seats: body.seats,                  
                                
                                      
                }
            }
            const result = await classCollection.updateOne(filter, updatedClass, options);
            res.send(result);
        })
        // todo

        app.post('/classes', async (req, res) => {
            const newClass = req.body
            const result = await classCollection.insertOne(newClass)
            res.send(result)
        })

        // students selected class apis
        app.get('/selected', async (req, res) => {
            const query = req.query
            const result = await SelectedClassCollection.find(query).toArray()
            res.send(result)
        })

        app.post('/selected', async (req, res) => {
            const selectedClass = req.body;
            // const query = { class: selectedClass.class }
            // const existingClass = await SelectedClassCollection.findOne(query);
            // if (existingClass) {
            //     return res.send({ message: 'Class already Selected' })
            // }
            const result = await SelectedClassCollection.insertOne(selectedClass)
            res.send(result)
        })

        app.delete('/selected/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const result = SelectedClassCollection.deleteOne(filter)
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('music server is running')
})

app.listen(port, () => {
    console.log('server running at 5000');
})