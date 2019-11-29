import * as functions from 'firebase-functions';
import * as express from 'express';
import { db } from './init';

const app = express();
const cors = require('cors');

app.use(cors({ origin: true }));

export const crudApi = functions.https.onRequest(app);

//GET all product With Id
app.get('/products', async (req, res) => {
  try {
    const docs = await db.collection('products').get();
    res.send(
      docs.docs.map((doc) => {
        return {
          productId: doc.id,
          ...doc.data(),
        };
      })
    );
  } catch (error) {
    res.status(400).send(`Cannot get contacts: ${error}`);
  }
});

// Get a Product byt ID
app.get('/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    await db
      .collection('products')
      .doc(`${productId}`)
      .get()
      .then((doc) => res.status(200).json({ doc }));
  } catch (error) {
    res.status(400).send(`Cannot get contacts: ${error}`);
  }
});

// Add new product
app.post('/products', async (req, res) => {
  try {
    const products = await db.collection('products').add({
      name: req.body['name'],
      categories: req.body['categories'],
      brand: req.body['brand']
    });
    res.status(200).send(`Created a new product: ${products.id}`);
  } catch (error) {
    console.log('Error From post req', error);
    res.status(404).send(error);
  }
});

// Update Product by Id
app.put('/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const data = {
      name: req.body['name'],
      category: req.body['category'],
      brand: req.body['brand'],
    };

    const updatedDoc = await db
      .collection('products')
      .doc(productId)
      .set(data, { merge: true });
    res.status(200).send(`Update a new contact: ${updatedDoc}`);
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});

// Delete a contact
app.delete('/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const deletedProduct = await db
      .collection('products')
      .doc(productId)
      .delete();
    res.status(200).send(`Product is deleted: ${deletedProduct}`);
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});

export { app };
