const chai = require('chai')
const assert = require('assert')
const chaiHttp = require('chai-http') //start de server
const server = require('../../app')
const expect = chai.expect;

chai.should()
chai.use(chaiHttp)

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