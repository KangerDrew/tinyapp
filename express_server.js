const express = require("express");
const app = express();
app.use(express.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

// Random test for returning hyperlink
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// This is the home page
// This showcases all the links and their shortcuts
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, newID: req.cookies.newID };
  res.render("urls_index", templateVars);
});

// This loads page where you can store new links
app.get("/urls/new", (req, res) => {
  const templateVars = { newID: req.cookies.newID }
  res.render("urls_new", templateVars);
});

// To store the login info using cookies
app.post('/login', (req,res) => {
  res.cookie('newID',req.body.newID);
  res.redirect('/urls')
})

// Delete existing cookie to logout
app.post('/logout', (req, res) => {
  res.clearCookie('newID');
  res.redirect('/urls');
})

// This is for the POST method that stores the generates new short
// links and saves them into the urlDatabase.
app.post("/urls", (req, res) => {
  let newShort = generateRandomString()
  // Use while loop to get new shortURL until it returns undefined
  // to prevent using same shortURL!
  while (urlDatabase[newShort] !== undefined) {
    newShort = generateRandomString()
  }
  urlDatabase[newShort] = req.body.longURL;
  res.redirect(`/urls/${newShort}`);         // Respond with 'Ok' (we will replace this)
});


// This retrieves the info from the urlDatabase to be displayed on urls/shortURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    newID: req.cookies.newID };
  res.render("urls_show", templateVars);
});

// This redirects to the longURL when the user clicks the shortURL
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.status(404);
    res.send("The short link is invalid!"); 
  } else {
    res.redirect(urlDatabase[req.params.shortURL]);
  }
});


// This edits the existing shortURL from the urlDatabase!
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.newLongURL;
  res.redirect(`/urls`);         // Respond with 'Ok' (we will replace this)
});



// This deletes the existing shortURL from the urlDatabase!
app.post("/urls/:shortURL/delete", (req, res) => {
  const toDelete = req.params.shortURL;
  delete urlDatabase[toDelete];
  res.redirect('/urls');
});


// Server starts
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});