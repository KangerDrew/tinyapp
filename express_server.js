const express = require("express");
const app = express();
app.use(express.urlencoded({extended: true}));
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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let newShort = generateRandomString()
  // Use while loop to get new shortURL until it returns undefined
  // to prevent using same shortURL!
  while (urlDatabase[newShort] !== undefined) {
    newShort = generateRandomString()
  }
  urlDatabase[newShort] = req.body.longURL;
  res.redirect(`/urls/${newShort}`);         // Respond with 'Ok' (we will replace this)
});



app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});