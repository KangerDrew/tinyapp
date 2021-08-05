const express = require("express");
const app = express();
app.use(express.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use( express.static( "views" ) );
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

const urlForUser = function(user_id) {
  const retObj = {};
  for (const short in urlDatabase) {
    if(urlDatabase[short].userID === user_id) {
      retObj[short] = urlDatabase[short];
    }
  }
  return retObj;
}

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "test1"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}


const generateRandomString = function() {
  let res = '';
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charLen = char.length;
  for (let i = 0; i < 6; i++) {
    res += char.charAt(Math.floor(Math.random() * charLen));
  }
  return res;
};


// Takes you to the "main page" with all the urls.
app.get("/", (req, res) => {
  res.redirect('/urls');
});

// Returns the urlDatabase object
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  const templateVars = { user_id: req.cookies.user_id, users: users };
  res.render("urls_registration", templateVars)
});

app.get("/login", (req, res) => {
  if (req.cookies.user_id !== undefined) {
    res.redirect('/')
  } else {
    const templateVars = { user_id: req.cookies.user_id, users: users };
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
  const customDatabase = urlForUser(req.cookies.user_id);
  const templateVars = { urls: customDatabase, user_id: req.cookies.user_id, users: users };
  res.render("urls_index", templateVars);
});












// This loads page where you can store new links
app.get("/urls/new", (req, res) => {
  if (req.cookies.user_id === undefined) {
    res.redirect('/')
  } else {
    const templateVars = { user_id: req.cookies.user_id, users: users }
    res.render("urls_new", templateVars);
  }
});

// To store the login info using cookies
app.post('/login', (req,res) => {

  for (const user in users) {
    if(users[user].email === req.body.email && users[user].password === req.body.password) {
      res.cookie('user_id', users[user].id);
      return res.redirect('/urls')
    }
  }
  res.status(403);
  res.send("Invalid email/password"); 

  //
})

// Delete existing cookie to logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})

// This is for the POST method that stores the generates new short
// links and saves them into the urlDatabase.
app.post("/urls", (req, res) => {
  
  // The for loop will compare the cookie user_id value
  // to see if there's a match with the one in database...

  for(const user in users) {
    if (user === req.cookies.user_id) {
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
  
  const customDatabase = urlForUser(req.cookies.user_id);
  if (customDatabase[req.params.shortURL] === undefined) {
    res.status(404);
    res.send("The short link is invalid!"); 
  } else {
    const templateVars = { shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user_id: req.cookies.user_id,
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
  urlDatabase[req.params.shortURL].longURL = req.body.newLongURL;
  res.redirect(`/urls`);         // Respond with 'Ok' (we will replace this)
});



// This deletes the existing shortURL from the urlDatabase!
app.post("/urls/:shortURL/delete", (req, res) => {
  const toDelete = req.params.shortURL;
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
  for (const user in users) {
    if(users[user].email === req.body.email) {
      res.status(400);
      res.send("Email already in use!"); 
    }
  }

  let randID = generateRandomString();
  // Same as we did for shortURL, we need while loop
  // to reset randID if it already exists within users object:
  while (users[randID] !== undefined) {
    randID = generateRandomString()
  }
  const user = {
    "id": randID,
    "email": req.body.email,
    "password": req.body.password
  };

  users[randID] = user;

  res.cookie('user_id', randID);
  res.redirect('/urls');

});


// Server starts
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});