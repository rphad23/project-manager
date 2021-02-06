const admin = require("firebase-admin");
const firebaseConfig = require("../firebaseConfig.json");
require("dotenv").config();

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig),
  databaseURL: process.env.DATABASE_URL,
});

const db = admin.database();

const testDB = () =>
  // fetch temperature data from firebase
  new Promise((resolve, reject) => {
    const ref = db.ref(`/test`);
    ref
      .once("value", function (snapshot) {
        const data = snapshot.val(); //Data is in JSON format.
        console.log(data);
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      });
  });

const createNewUser = (uid, email, name, picture) =>
  new Promise((resolve, reject) => {
    const ref = db.ref(`/users/${uid}`);
    const data = {
      uid: uid,
      email: email,
      name: name,
      picture: picture,
    } 

    ref.set(data, (error) => {
      if(error) {
        reject(error)
      }
      else {
        resolve(true)
      }
    })
  });

module.exports = { testDB, createNewUser };
