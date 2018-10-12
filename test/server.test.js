'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');



const expect = chai.expect;

chai.use(chaiHttp);

describe('Reality check', function () {

  it('true should be true', function () {
    expect(true).to.be.true;
  });

  it('2 + 2 should equal 4', function () {
    expect(2 + 2).to.equal(4);
  });

});

describe('Express static', function () {

  it('GET request "/" should return the index page', function () {
    return chai.request(app)
      .get('/')
      .then(function (res) {
        expect(res).to.exist;
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      });
  });

});

describe('404 handler', function () {

  it('should respond with 404 when given a bad path', function () {
    return chai.request(app)
      .get('/DOES/NOT/EXIST')
      .then(res => {
        expect(res).to.have.status(404);
      });
  });

});


describe('GET /api/notes', function () {
  it('should return 10 note array with id, title, content ', function () {
    return chai.request(app)
      .get('/api/notes')
      .then(res => {
        expect(res.body).to.be.a('array');
        expect(res.body.length).to.equal(10);
        res.body.forEach(note => {
          expect(note).to.be.a('object');
          expect(note).to.include.keys('id', 'title', 'content');
        });
      });
  });
  it('should return a correct result for a valid search query', function () {
    return chai.request(app)
      .get('/api/notes?searchTerm=government')
      .then(res => {
        expect(res.body[0].title).includes('government');
      });
  });

  it('should return an empty array for incorrect search query', function () {
    return chai.request(app)
      .get('/api/notes?searchTerm=INVALIDSEARCHTERM')
      .then(function (res) {
        console.log(res.body);
        expect(res.body).to.be.a('array');
        expect(res.body.length).to.equal(0);
      });
  });

});

describe('GET /api/notes:id', function () {
  it('should return correct note for given id', function () {

    return chai.request(app)
      .get('/api/notes/1001')
      .then(function (res) {
        expect(res.body.id).to.equal(1001);
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('id', 'title', 'content');
      });
  });

  it('should return 404 for incorrect id', function () {
    return chai.request(app)
      .get('/api/notes/9999')
      .then(function (res) {
        expect(res).to.have.status(404);
      });
  });

});

describe('POST /api/notes', function () {
  it('should create and return new item with location header when provided valid data', function () {
    const newItem = { 'title': 'New', 'content': 'This is a new item' };
    return chai.request(app)
      .post('/api/notes')
      .send(newItem)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res.header.location).to.exist;
      });
  });

  it('should return an object with a message property "Missing title in request body" when missing "title" field', function () {
    const newItem = { 'content': 'this is a new item without title' };
    return chai.request(app)
      .post('/api/notes')
      .send(newItem)
      .then(function (res) {
        expect(res.body).to.be.a('object');
        expect(res.body.message).to.equal('Missing `title` in request body');
      });
  });

});

describe('PUT /api/notes/:id', function () {


  it('should update notes on PUT', function () {
    const updateData = {
      'title': 'Updated Note',
      'content': 'This note has been updated'
    };
    return chai.request(app)
      // first have to get so we have an idea of object to update
      .get('/api/notes')
      .then(function (res) {
        updateData.id = res.body[0].id;
        return chai.request(app)
          .put(`/api/notes/${updateData.id}`)
          .send(updateData);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.deep.equal(updateData);
      });
  });

  it('should return 404 if invalid id', function () {
    const updateData = {
      'title': 'Updated Note',
      'content': 'This note has been updated'
    };
    return chai.request(app)
      .put('/api/notes/9999')
      .send(updateData)
      .then(function (res) {
        expect(res).to.have.status(404);
      });
  });

  it('should return an object with a message property "Missing title in request body" when missing "title" field', function () {
    const updateData = {

      'content': 'This note has been updated'
    };
    return chai.request(app)
      .put('/api/notes/1001')
      .send(updateData)
      .then(function (res) {
        expect(res.body).to.be.a('object');
        expect(res.body.message).to.equal('Missing `title` in request body');
      });
  });

});

describe('DELETE /api/notes/:id', function () {
  it('should delete an item by id', function () {
    return chai.request(app)
      .get('/api/notes')
      .then(function (res) {
        const deleteId = res.body[0].id;
        return chai.request(app)
          .delete(`/api/notes/${deleteId}`)
          .then(function (res) {
            expect(res).to.have.status(204);
          });
      });
  });
});
