import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { auth } from 'firebase-admin';

admin.initializeApp();

export const createFirebaseToken = functions.https.onRequest(async (req, res) => {
  const auth0Token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!auth0Token) {
    res.status(401).send('Unauthorized');
    return;
  }

  try {
    // Verify the Auth0 token and get the user info
    // You'll need to implement this part based on your Auth0 setup
    const auth0User = await verifyAuth0Token(auth0Token);
    
    // Create a custom token
    const firebaseToken = await auth().createCustomToken(auth0User.sub, {
      sub: auth0User.sub
    });
    
    res.json({ firebaseToken });
  } catch (error) {
    console.error('Error creating Firebase token:', error);
    res.status(500).send('Internal Server Error');
  }
}); 