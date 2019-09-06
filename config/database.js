const mongoose = require('mongoose');

const uri = 'mongodb+srv://dbUser-admin:otorinolaringologija@quote-finder-efbcl.mongodb.net/quote-finder-db?retryWrites=true&w=majority';

module.exports = {
  connect() {
    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);
    mongoose.connect(uri, { useNewUrlParser: true }, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('MongoDB Connected');
      }
    });
  },
};
