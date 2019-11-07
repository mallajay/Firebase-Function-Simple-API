import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

const app = express();

export const webApi = functions.https.onRequest(app);

// Get all products
app.get("/products", async (req, res) => {
  try {
    const snaps = await db.collection("products").get();
    const products: any[] = [];
    snaps.forEach(snap => products.push(snap.data()));
    res.status(200).json({ products });
  } catch (error) {
    res.status(400).send(`Cannot get contacts: ${error}`);
  }
});

// Get a Product byt ID
app.get("/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    await db
      .collection("products")
      .doc(`${productId}`)
      .get()
      .then(doc => res.status(200).json({ doc }));
  } catch (error) {
    res.status(400).send(`Cannot get contacts: ${error}`);
  }
});

// Add new product
app.post("/products", async (req, res) => {
  try {
    const products = await db.collection("products").add({
      name: req.body["name"],
      category: req.body["category"],
      brand: req.body["brand"]
    });
    res.status(200).send(`Created a new contact: ${products.id}`);
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});

// Update Product by Id
app.put("/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const data = {
      name: req.body["name"],
      category: req.body["category"],
      brand: req.body["brand"]
    };

    const updatedDoc = await db
      .collection("products")
      .doc(productId)
      .set(data, { merge: true });
    res.status(200).send(`Update a new contact: ${updatedDoc}`);
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});

// Delete a contact
app.delete("/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const deletedProduct = await db
      .collection("products")
      .doc(productId)
      .delete();
    res.status(200).send(`Product is deleted: ${deletedProduct}`);
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});

export { app };
