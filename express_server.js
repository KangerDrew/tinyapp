const express = require("express");
const { getUserByEmail, generateRandomString, urlForUser } = require('./helpers');
const app = express();
app.use(express.urlencoded({extended: true}));

// const cookieParser = require('cookie-parser');
// app.use(cookieParser());
// Below is the new encrypted cookie method:
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['someValue'],
}))

app.use( express.static( "views" ) );
const bcrypt = require('bcrypt');
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "userRandomID"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "userRandomID"
  }
};


const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "$2b$10$gG8v0S8xI0dkl6WplLsTMOVBqWAVUj9u.qNTQQDYc1Wf5WcJyP3pW" // pw is: test1
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "$2b$10$wp4R39ebDEXFxkeybS7eYestUyHPN7vgNiNrAej9Md81MG75FDzD6" // pw is: test2
  }
}




// Takes you to the "main page" with all the urls.
app.get("/", (req, res) => {
  res.redirect('/urls');
});

// Returns the urlDatabase object
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  const templateVars = { user_id: req.session.user_id, users: users };
  res.render("urls_registration", templateVars)
});

app.get("/login", (req, res) => {
  if (req.session.user_id !== undefined) {
    res.redirect('/')
  } else {
    const templateVars = { user_id: req.session.user_id, users: users };
    res.render("urls_login", templateVars)
  } 
});

// Random test for returning hyperlink
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// This is the home page
// This showcases all the links and their shortcuts
app.get("/urls", (req, res) => {
  const customDatabase = urlForUser(req.session.user_id, urlDatabase);
  const templateVars = { urls: customDatabase, user_id: req.session.user_id, users: users };
  res.render("urls_index", templateVars);
});


// This loads page where you can store new links
app.get("/urls/new", (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect('/')
  } else {
    const templateVars = { user_id: req.session.user_id, users: users }
    res.render("urls_new", templateVars);
  }
});

// To store the login info using cookies
app.post('/login', (req,res) => {

  // for (const user in users) {
  //   // Must run bcrypt compare to see that incoming password checks out
  //   // when compared to the stored hashed value in user database.
  //   const checkResult = bcrypt.compareSync(req.body.password, users[user].password)

  //   if(users[user].email === req.body.email && checkResult) {
  //     req.session.user_id = users[user].id;
  //     return res.redirect('/urls')
  //   }
  // }

  const user = getUserByEmail(req.body.email, users)
  // Confirm that the function returned a user object!
  if (!user) {
    res.status(403);
    return res.send("The email doesn't exist."); 
  }

  // After this point, check if the password is correct!
  const passwordCheck = bcrypt.compareSync(req.body.password, user.password);
  if (!passwordCheck) {
    res.status(403);
    return res.send("Incorrect password."); 
  }

  req.session.user_id = user.id;
  return res.redirect('/urls');
})

// Delete existing cookie to logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
})

// This is for the POST method that stores the generates new short
// links and saves them into the urlDatabase.
app.post("/urls", (req, res) => {
  
  // The for loop will compare the cookie user_id value
  // to see if there's a match with the one in database...

  for(const user in users) {
    if (user === req.session.user_id) {
      let newShort = generateRandomString()
      // Use while loop to get new shortURL until it returns undefined
      // to prevent using same shortURL!
      while (urlDatabase[newShort] !== undefined) {
        newShort = generateRandomString()
      }
      urlDatabase[newShort] = {
        "longURL": req.body.longURL,
        "userID": user
      };
      return res.redirect(`/urls/${newShort}`);         // Respond with 'Ok' (we will replace this)
    }
  }

  // This only triggers if someone attempts to submit links
  // without logging in as a user.
  res.status(403);
  return res.send("Must be logged in to submit links!"); 

});


// This retrieves the info from the urlDatabase to be displayed on urls/shortURL
app.get("/urls/:shortURL", (req, res) => {

  const customDatabase = urlForUser(req.session.user_id, urlDatabase);

  if (customDatabase[req.params.shortURL] === undefined) {
    res.status(404);
    res.send("The short link is invalid!"); 
  } else {
    const templateVars = { shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user_id: req.session.user_id,
      users: users };
    res.render("urls_show", templateVars);
  }
  
});


// This redirects to the longURL when the user clicks the shortURL
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.status(404);
    res.send("The short link is invalid!"); 
  } else {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  }
});


// This edits the existing shortURL from the urlDatabase!
app.post("/urls/:shortURL", (req, res) => {

  // Checks if the user that's changing the file has
  // permission or not.
  
  if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    res.status(404);
    return res.send("You do not have permission for that.")
  }

  urlDatabase[req.params.shortURL].longURL = req.body.newLongURL;
  res.redirect(`/urls`);         // Respond with 'Ok' (we will replace this)
});


// This deletes the existing shortURL from the urlDatabase!
app.post("/urls/:shortURL/delete", (req, res) => {
  const toDelete = req.params.shortURL;

  // Check if this is indeed the user that has permission
  // to delete this.

  if (req.session.user_id !== urlDatabase[toDelete].userID) {
    res.status(404);
    return res.send("You do not have permission for that.")
  }

  delete urlDatabase[toDelete];
  res.redirect('/urls');
});

// This is to store registration information inside the 
// users object.
app.post("/register", (req, res) => {

  if(req.body.email === "" || req.body.password === "") {
    res.status(400);
    res.send("Please input email/password!"); 
  }

  const userExist = getUserByEmail(req.body.email, users);
  if (userExist) {
    res.status(400);
    return res.send("Email already in use!"); 
  }

  let randID = generateRandomString();
  // Same as we did for shortURL, we need while loop
  // to reset randID if it already exists within users object:
  while (users[randID] !== undefined) {
    randID = generateRandomString()
  }

  // Use bcrypt to store the hashed password instead of
  // the actual string value...

  const hashPassword = bcrypt.hashSync(req.body.password, 10);

  const user = {
    "id": randID,
    "email": req.body.email,
    "password": hashPassword
  };

  users[randID] = user;

  req.session.user_id = randID;
  res.redirect('/urls');

});


// Server starts
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});