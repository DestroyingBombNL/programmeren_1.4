const chai = require('chai')
const assert = require('assert')
const chaiHttp = require('chai-http') //start de server
const server = require('../../app')
const expect = chai.expect;

chai.should()
chai.use(chaiHttp)

describe('UC-101 / Inloggen', function () {
  it('TC-101-1 / Verplicht veld ontbreekt', (done) => {
    const TC101_1_login = {
      "password": "secret"
    }

    chai
    .request(server)
    .post('/api/login')
    .send(TC101_1_login)
    .end((err, res) => {
        res.should.have.status(400);
        expect(res.body.message).to.include('emailAdress');
        expect(res.body.data).to.be.empty;
        done()
    })
  })

  it('TC-101-2 / Niet-valide wachtwoord', (done) => {
    const TC101_2_login = {
      "emailAdress": "invalidEmail",
      "password": "secret"
    }

    chai
    .request(server)
    .post('/api/login')
    .send(TC101_2_login)
    .end((err, res) => {
        res.should.have.status(400);
        expect(res.body.message).to.include('emailAdress');
        expect(res.body.data).to.be.empty;
        done()
    })
  })

  it('TC-101-3 / Gebruiker bestaat niet ', (done) => {
    const TC101_3_login = {
      "emailAdress": "lsas@live.nl",
      "password": "secret"
    }

    chai
    .request(server)
    .post('/api/login')
    .send(TC101_3_login)
    .end((err, res) => {
        res.should.have.status(404);
        expect(res.body.message).to.include('No user found');
        expect(res.body.data).to.be.empty;
        done()
    })
  })

  it('TC-101-4 / Gebruiker succesvol ingelogd', (done) => {
    const TC101_4_login = {
      "emailAdress": "j.doe@server.com",
      "password": "secret"
    }

    chai
    .request(server)
    .post('/api/login')
    .send(TC101_4_login)
    .end((err, res) => {
      assert(err === null)
      res.should.have.status(200);
      res.body.data.should.have.property('id');
      res.body.data.should.have.property('firstName');
      res.body.data.should.have.property('lastName');
      res.body.data.should.have.property('emailAdress');
      res.body.data.should.have.property('password');
      res.body.data.should.have.property('phoneNumber');
      res.body.data.should.have.property('street');
      res.body.data.should.have.property('city');
      res.body.data.should.have.property('token');
      assert(res.body.data.token !== null)
      done()
    })
  })
})

describe('UC-102 / Opvragen van systeeminformatie', function () {
  it('TC-102-1 / Server info should return succesful information', (done) => {
    chai
      .request(server)
      .get('/api/info')
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.has.property('status').to.be.equal(200);
        res.body.should.has.property('message');
        res.body.should.has.property('data');
        let { data, message } = res.body;
        data.should.be.an('object');
        data.should.has.property('studentName').to.be.equal('(Yong Zhe) Sven Hu');
        data.should.has.property('studentNumber').to.be.equal(2205932);
        done();
      });
  });
  it('TC-102-2 - Server should return valid error when endpoint does not exist', (done) => {
    chai
      .request(server)
      .get('/api/doesnotexist')
      .end((err, res) => {
        assert(err === null);
        res.body.should.be.an('object');
        let { data, message, status } = res.body;
        status.should.equal(404);
        message.should.be.a('string').that.is.equal('Endpoint not found');
        data.should.be.an('object');
        done();
      });
  });
});