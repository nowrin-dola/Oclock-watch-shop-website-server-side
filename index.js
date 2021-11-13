const express = require ('express');
const app = express();

const ObjectId = require ('mongodb').ObjectId;
const cors = require ('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');

const port = process.env.PORT ||7000;


// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fw2fr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri)


async function run(){

    try{

        await client.connect();
       const database= client.db('watchStore');
       const watchCollection = database.collection('watches');
       const userCollection = database.collection('users');
       const orderCollection = database.collection('orders');
       const reviewCollection = database.collection('reviews');

       // get homepage watches

       app.get('/collection', async(req,res)=>{
        const cursor = watchCollection.find({}).limit(6);
        const watches = await cursor.toArray();
        res.send(watches);
    });

     // get all watches

     app.get('/allCollection', async(req,res)=>{
        const cursor = watchCollection.find({});
        const watches = await cursor.toArray();
        res.send(watches);
    });

    
    // get single watch

        app.get('/allCollection/:id', async (req, res)=>{
            const id=req.params.id;
            const query={_id: ObjectId(id)};
            const watchDetail = await watchCollection.findOne(query)
            res.json(watchDetail)
        });

        
    // addWatches api
     app.post('/addWatches', async(req,res)=>{
        console.log(req.body);
        const result = await watchCollection.insertOne(req.body);
        res.json(result);
     })


      /// delete order

      app.delete("/deleteProduct/:id", async (req, res) => {
        const result = await watchCollection.deleteOne({
        _id: ObjectId(req.params.id),
        });
        res.send(result);
    });

        // for login user information

        app.post('/users', async(req,res)=>{  
             const user = req.body;
            const result = await userCollection.insertOne(user);
            console.log(result)
            res.json(result);
        
        });
       
        app.put('/users', async(req,res)=>{
            const user = req.body;
            
            const filter = {email: user.email};
            const options = {upsert: true};
            const updateDoc = {$set : user}
            const result  = await userCollection.updateOne(filter, updateDoc , options);
            console.log(result)
            res.json(result);
        });

        // post order information
        app.post('/orders', async (req,res)=>{
            const order = req.body;
            
            const result = await orderCollection.insertOne(order);
                console.log(result)
                
                res.json(result)
        });

          // get my all orders by email
       app.get('/orders/:email', async(req,res)=>{
       console.log(req.params.email);
       const result =await orderCollection.find({email: req.params.email}).toArray();
       console.log(result);
       res.send(result);

        });
        // get my all user orders
        app.get("/orders", async (req, res) => {
          
            const result = await orderCollection.find({}).toArray();
            res.send(result);
          });



        /// delete order

            app.delete("/deleteOrder/:id", async (req, res) => {
                const result = await orderCollection.deleteOne({
                _id: ObjectId(req.params.id),
                });
                res.send(result);
            });

        // addReviews api
        app.post('/addReviews', async(req,res)=>{
        console.log(req.body);
        const result = await reviewCollection.insertOne(req.body);
        
        res.json(result);
        console.log(result);
     });


    //  homepage reviews
     app.get('/allReviews', async(req,res)=>{
        const cursor = reviewCollection.find({});
        const reviews = await cursor.toArray();
        res.send(reviews);
    });

    app.get('/users/:email', async(req,res)=>{
        const email = req.params.email;
        const query = {email:email};
        const user = await userCollection.findOne(query)
        let isAdmin = false;
        if(user?.role === 'admin'){
            isAdmin = true;
        }
        res.json({admin : isAdmin})
    })


    app.put('/users/admin', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const updateDoc ={$set: {role: 'admin'}};
        const result = await userCollection.updateOne(filter,updateDoc);
        res.json(result);
        console.log(result);
       
    });


    // update status 
    app.put('/orders/:id', async (req, res) => {
        const id = req.params.id;
        const updatedUser = req.body;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
            $set: {
                status: updatedUser.status
               
            },
        };
        const result = await orderCollection.updateOne(filter, updateDoc, options);
        
        console.log('updating', req.body)
        res.json(result)
        console.log('hi', result)
        
    })






    }
    finally{
        // await client.close();
    }




}

run().catch(console.dir)

app.get('/',(req,res)=>{
    res.send('hello oClock server');
})

app.listen(port,()=>{
    console.log(`port is running at http://localhost:${port}`)
})