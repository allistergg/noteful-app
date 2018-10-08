'use strict';

// Load array of notes
const data = require('./db/notes');

console.log('Hello Noteful!');

// INSERT EXPRESS APP CODE HERE...

const express = require('express');

const app = express();

app.use(express.static('public'));

app.get('/api/notes', (req, res) => {
  if (req.query.searchTerm) {
    const searchTerm = (req.query.searchTerm);
    const searchedItems = data.filter(item => item.title.includes(searchTerm) || item.content.includes(searchTerm));
    res.json(searchedItems);
  } else {
    res.json(data);
  }
});

app.get('/api/notes/:id', (req, res) => {
  const id = req.params.id;
  const foundItem = data.find(item => item['id'] === Number(id));
  res.json(foundItem);
});


app.listen(8080, function() {
  console.info(`Server listening on ${this.address().port}`);
}).on('error', err => {
  console.log(err);

});
