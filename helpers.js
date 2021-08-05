const getUserByEmail = function(email, database) {
  for (const user in database) {
    if(database[user].email === email) {
      return database[user];
    } 
  }
  return undefined;
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

const urlForUser = function(user_id, database) {
  const retObj = {};
  for (const short in database) {
    if(database[short].userID === user_id) {
      retObj[short] = database[short];
    }
  }
  return retObj;
};


module.exports = { getUserByEmail, generateRandomString, urlForUser };