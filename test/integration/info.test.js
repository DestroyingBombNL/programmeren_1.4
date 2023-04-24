const chai = require('chai')
const assert = require('assert')
const chaiHttp = require('chai-http') //start de server
const server = require('../../app')

chai.should()
chai.use(chaiHttp)

describe('Server-succesfull results', () => { //suite waar je meerdere testcases kan hebben
    it('TC-201-5 / Gebruiker succesvol geregistreerd', (done) => {
        const newUser = {
            username: "Steven Universe",
            email: "TheCrystalGems@Gmail.com",
            password: "CookieCat"
        }

        chai
        .request(server)
        .post('/api/user')
        .send(newUser)
        .end((err, res) => {
            assert(err === null)
            res.should.have.status(201);
            res.body.data.should.be.an('object');
            res.body.data.should.have.property('id');
            res.body.data.should.have.property('username', newUser.username);
            res.body.data.should.have.property('email', newUser.email);
            res.body.data.should.have.property('password', newUser.password);
            done()
        })
    })

    it('TC-202-1 / Toon alle gebruikers', (done) => {        
        chai
        .request(server)
        .get('/api/user')
        .end((err, res) => {
            assert(err === null)
            res.should.have.status(200);
            res.body.data.should.be.an('array');
            res.body.data.should.have.lengthOf.at.least(2);
            done()
        })
    })

    it('TC-203-2 / Gebruiker is ingelogd met geldig token', (done) => {
        chai
        .request(server)
        .get('/api/user/profile')
        .end((err, res) => {
            assert(err === null)
            res.should.have.status(200);
            res.body.data.should.be.an('object');
            res.body.data.should.have.property('id');
            res.body.data.should.have.property('username');
            res.body.data.should.have.property('email');
            res.body.data.should.have.property('password');
            done()
        })
    })

    it('TC-204-3 / Gebruiker-ID bestaat', (done) => {
        chai
        .request(server)
        .get('/api/user/1')
        .end((err, res) => {
            assert(err === null)
            res.should.have.status(200);
            res.body.data.should.be.an('object');
            res.body.data.should.have.property('id');
            res.body.data.should.have.property('username');
            res.body.data.should.have.property('email');
            res.body.data.should.have.property('password');
            done()
        })
    })

    it('TC-206-4 / Gebruiker succesvol verwijderd', (done) => {
        chai
        .request(server)
        .delete('/api/user/1')
        .end((err, res) => {
            assert(err === null)
            res.should.have.status(200);
            res.body.data.should.be.an('object');
            const deletedId = parseInt(res.body.message.split(':')[1].replace(/\s/g, ''))
            assert(deletedId === 1)
            done()
        })
    })

    /*
    it('TC-102- Server info', (done) => {
        chai
        .request(server)
        .get('/api/info')
        .end((err, res) => {
            assert(err === null)
            res.body.should.be.an('object')
            res.body.should.has.property('status').to.be.equal(200)
            res.body.should.has.property('message').to.be.equal('Server info-endpoint')
            res.body.should.has.property('data')
            let {data} = res.body
            data.should.be.an('object')
            data.should.has.property('studentId').to.be.equal(1)
            data.should.has.property('studentName').to.be.equal('Sven')
            data.should.has.property('description').to.be.equal('Welcome to the ShareAMeal API')
            done()
        })
    })

    it('TC-103- Server should return error when the endpoint does not exist', (done) => {
        chai
        .request(server)
        .get('/api/doesnotexist')
        .end((err, res) => {
            assert(err === null)
            res.body.should.be.an('object')
            res.body.should.has.property('status').to.be.equal(404)
            res.body.should.has.property('message').to.be.equal('Endpoint not found')
            res.body.should.has.property('data')
            let {data} = res.body

            //status.should.equal(404)
            //message.should.be.a('string).
            //let person = {firstname: 'Robin', lastname: 'Schellius'}
            // let { firstname, lastname } = person
            //let {firstname, rest } = person
            data.should.be.an('object')
            done()
        })
    })*/
})