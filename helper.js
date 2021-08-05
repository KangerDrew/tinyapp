const bcrypt = require('bcrypt');

const pw1 = 'test1';
const pw2 = 'test2';

// bcrypt.genSalt(10)
//   .then((salt) => {
//     return bcrypt.hash(pw1,salt);
//   })
//   .then((hash) => {
//     console.log(hash);
//   })

const pw1hash = bcrypt.hashSync(pw1, 10);
const pw2hash = bcrypt.hashSync(pw2, 10);

bcrypt.compare('test2',pw2hash)
  .then((result) => {
    console.log(result);
  })

bcrypt.compare('test1',pw1hash)
.then((result) => {
  console.log(result);
})