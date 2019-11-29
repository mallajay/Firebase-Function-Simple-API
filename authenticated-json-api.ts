
import * as functions from 'firebase-functions';
import * as express from 'express';
const admin = require('firebase-admin');
import { db } from './init';

const cookieParser = require('cookie-parser')();
const cors = require('cors')({ origin: true });
const app = express();

const validateFirebaseIdToken = async (req, res, next) => {
  console.log('Check if request is authorized with Firebase ID token');

  if (
    (!req.headers.authorization ||
      !req.headers.authorization.startsWith('Bearer ')) &&
    !(req.cookies && req.cookies.__session)
  ) {
    console.error(
      'No Firebase ID token was passed as a Bearer token in the Authorization header.',
      'Make sure you authorize your request by providing the following HTTP header:',
      'Authorization: Bearer <Firebase ID Token>',
      'or by passing a "__session" cookie.'
    );
    // res.status(403).send('Unauthorized');
    res
      .status(400)
      .send(
        JSON.stringify({ res: 'unauthorized', authorization: req.headers })
      );
    return;
  }
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    console.log('Found "Authorization" header');
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else if (req.cookies) {
    console.log('Found "__session" cookie');
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  } else {
    // No cookie
    // res.status(403).send('Unauthorized');
    res
      .status(400)
      .send(
        JSON.stringify({ res: 'unauthorized', authorization: req.headers })
      );
    return;
  }

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    console.log('ID Token correctly decoded', decodedIdToken);
    req.user = decodedIdToken;
    next();
    return;
  } catch (error) {
    console.error('Error while verifying Firebase ID token:', error);
    // res.status(403).send('Unauthorized');
    res
      .status(400)
      .send(
        JSON.stringify({ res: 'unauthorized', authorization: req.headers })
      );
    return;
  }
};

app.use(cors);
app.use(cookieParser);
app.use(validateFirebaseIdToken);
app.get('/hello', (req, res) => {
  res.send('Hello');
});

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
    res.status(400).send(`Cannot get products: ${error}`);
  }
});

export const authData = functions.https.onRequest(app);
