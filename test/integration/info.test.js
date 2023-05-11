const chai = require('chai')
const assert = require('assert')
const chaiHttp = require('chai-http') //start de server
const server = require('../../app')
const { create } = require('domain')

chai.should()
chai.use(chaiHttp)

let createdId

describe('UC-201 / Registeren als nieuwe user', () => {
    it('TC-201-5 / Gebruiker succesvol geregistreerd', (done) => {
        const newUser = {
            "firstName": "Sven",
            "lastName": "Hu",
            "emailAdress": "svenhum@live.nl",
            "password": "hilias",
            "phoneNumber": "0624275193",
            "street": "mesdagstraat",
            "city": "Zwijndrecht"
        }

        chai
        .request(server)
        .post('/api/user')
        .send(newUser)
        .end((err, res) => {
            assert(err === null)
            res.should.have.status(201);
            res.body.data.should.have.property('id');
            res.body.data.should.have.property('firstName', newUser.firstName);
            res.body.data.should.have.property('lastName', newUser.lastName);
            res.body.data.should.have.property('emailAdress', newUser.emailAdress);
            res.body.data.should.have.property('password', newUser.password);
            res.body.data.should.have.property('phoneNumber', newUser.phoneNumber);
            res.body.data.should.have.property('street', newUser.street);
            res.body.data.should.have.property('city', newUser.city);
            createdId = res.body.data.id
            done()
        })
    })
})

describe('UC-202 / Opvragen van overzicht van users', () => {
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
})

describe('UC-203 / Opvragen van gebruikersprofiel', () => {
    it('TC-203-2 / Gebruiker is ingelogd met geldig token', (done) => {
        chai
        .request(server)
        .get('/api/user/profile')
        .end((err, res) => {
            assert(err === null)
            res.should.have.status(200);
            res.body.data[0].should.have.property('id');
            res.body.data[0].should.have.property('firstName');
            res.body.data[0].should.have.property('lastName');
            res.body.data[0].should.have.property('emailAdress');
            res.body.data[0].should.have.property('password');
            res.body.data[0].should.have.property('phoneNumber');
            res.body.data[0].should.have.property('street');
            res.body.data[0].should.have.property('city');
            done()
        })
    })
})

describe('UC-204 / Opvragen van usergegevens bij ID', () => {
    it('TC-204-3 / Gebruiker-ID bestaat', (done) => {
        chai
        .request(server)
        .get('/api/user/1')
        .end((err, res) => {
            assert(err === null)
            res.should.have.status(200);
            res.body.data[0].should.have.property('id');
            res.body.data[0].should.have.property('firstName');
            res.body.data[0].should.have.property('lastName');
            res.body.data[0].should.have.property('emailAdress');
            res.body.data[0].should.have.property('password');
            res.body.data[0].should.have.property('phoneNumber');
            res.body.data[0].should.have.property('street');
            res.body.data[0].should.have.property('city');
            done()
        })
    })
})

describe('UC-205 / Updaten van usergegevens', () => {

})

describe('UC-206 / Verwijderen van user', () => {
    it('TC-206-4 / Gebruiker succesvol verwijderd', (done) => {
        chai
        .request(server)
        .delete(`/api/user/10`)
        .end((err, res) => {
            res.should.have.status(200);
            done()
        })
    })
})

/*describe('Server-succesfull results', () => {
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
    })
})*/

describe ('Depopulate database', () => {

})