const { assert, expect } = require('chai');

const { getUserByEmail, urlForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

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

describe('getUserByEmail', function() {
  it('should return a user object with valid email', function() {
    const testUser = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    };
    assert.deepEqual(testUser,expectedOutput);
  });
  it("should return undefined if email doesn't exist.", function() {

    const testUser = getUserByEmail('nonexistent@invalid.com',testUsers);
    const expectedUser = undefined;
    assert.strictEqual(testUser,expectedUser);
  })
});

describe('urlForUser', function() {
  it('should return database that only contains link for userRandomID', function() {
    const testDatabase = urlForUser("userRandomID", urlDatabase);
    const expectedOutput = urlDatabase;
    assert.deepEqual(testDatabase,expectedOutput);
  });
  it("should return empty object for user2RandomID", function() {

    const testDatabase = urlForUser("user2RandomID", urlDatabase);
    assert.isEmpty(testDatabase);
  });
  it("should return empty object for non-existant user", function() {

    const testDatabase = urlForUser("stranger", urlDatabase);
    assert.isEmpty(testDatabase);
  });
});