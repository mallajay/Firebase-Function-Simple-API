import * as functions from 'firebase-functions';
import { db } from './init';

// Express
import * as express from 'express';
const cors = require('cors');

// Most basic HTTP Funtion
//https://us-central1-function-login-94e8c.cloudfunctions.net/basicHTTP?name=ajay

export const basicHTTP = functions.https.onRequest((request, response) => {
  const name = request.query.name;

  if (!name) {
    response.status(400).send('ERROR you must supply a name :(');
  }

  response.send(`hello ${name}`);
});

// Custom Middleware
const auth = (req, res, next) => {
  if (!req.headers.authorization) {
    res
      .status(400)
      .send(
        JSON.stringify({ res: 'unauthorized', authorization: req.headers })
      );
  }
  next();
};

// Multi Route ExpressJS HTTP Function
const app = express();
app.use(cors({ origin: true }));
app.use(auth);

app.get('/cat', (request, response) => {
  response.send('CAT');
});

app.get('/dog', (request, response) => {
  response.send('DOG');
});

app.get('/products', async (req, res) => {
  const docs = await db.collection('products').get();
  res.send(
    docs.docs.map((doc) => {
      return {
        productId: doc.id,
        ...doc.data(),
      };
    })
  );
});

export const api = functions.https.onRequest(app);
