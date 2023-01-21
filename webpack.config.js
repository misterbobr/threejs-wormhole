const path = require('path');

module.exports = {
  entry: './index2.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, ''),
  },
};