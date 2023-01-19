const path = require('path');

module.exports = {
  entry: './test.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, ''),
  },
};