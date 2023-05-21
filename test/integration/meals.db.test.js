const chai = require('chai')
const assert = require('assert')
const chaiHttp = require('chai-http') //start de server
const server = require('../../app')
const expect = chai.expect;
chai.should()
chai.use(chaiHttp)

let token;
let createdMealId;

describe('Set variables', () => {
    it('Set token', (done) => {
        const login = {
            "emailAdress": "j.doe@server.com",
            "password": "secret"
        }
        chai
        .request(server)
        .post('/api/login')
        .send(login)
        .end((err, res) => {
            assert(err === null)
            res.should.have.status(200);
            token = res.body.data.token;
            done()
        })
    })
})

describe('UC-301 / Registeren als nieuwe user', () => {
    it('TC-301-1 / Verplicht veld ontbreekt', (done) => {
        const TC301_1_create = {            
            "isActive": false,
            "isVega": false,
            "isVegan": false,
            "isToTakeHome": false,
            "dateTime": "2023-05-21T12:27:59",
            "createDate": "2023-05-19",
            "updateDate": "2023-05-20",
            "maxAmountOfParticipants": 8,
            "price": 5.30,
            "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8Mnx8fGVufDB8fHx8fA%3D%3D&w=1000&q=80",
            "name": "Spaghetti Bolognese",
            "allergenes": ["gluten"]
        }
        chai
        .request(server)
        .post('/api/meal')
        .send(TC301_1_create)
        .set('Authorization', token)
        .end((err, res) => {
            res.should.have.status(400);
            expect(res.body.data).to.be.empty;
            expect(res.body.message).to.include('description');
            done()
        })
    })

    it('TC-301-2 / Niet ingelogd', (done) => {
        const TC301_2_create = {            
            "isActive": false,
            "isVega": false,
            "isVegan": false,
            "isToTakeHome": false,
            "dateTime": "2023-05-21T12:27:59",
            "createDate": "2023-05-19",
            "updateDate": "2023-05-20",
            "maxAmountOfParticipants": 8,
            "price": 5.30,
            "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8Mnx8fGVufDB8fHx8fA%3D%3D&w=1000&q=80",
            "name": "Spaghetti Bolognese",
            "description": "A tasty meal",
            "allergenes": ["gluten"]
        }
        chai
        .request(server)
        .post('/api/meal')
        .send(TC301_2_create)
        .end((err, res) => {
            res.should.have.status(401);
            expect(res.body.data).to.be.empty;
            expect(res.body.message).to.include('User is not logged in');
            done()
        })
    })

    it('TC-301-3 / Maaltijd succesvol toegevoegd', (done) => {
        const TC301_3_create = {            
            "isActive": false,
            "isVega": false,
            "isVegan": false,
            "isToTakeHome": false,
            "dateTime": "2023-05-21T12:27:59",
            "createDate": "2023-05-19",
            "updateDate": "2023-05-20",
            "maxAmountOfParticipants": 8,
            "price": 5.30,
            "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8Mnx8fGVufDB8fHx8fA%3D%3D&w=1000&q=80",
            "name": "Spaghetti Bolognese",
            "description": "A tasty meal",
            "allergenes": ["gluten"]
        }

        chai
        .request(server)
        .post('/api/meal')
        .send(TC301_3_create)
        .set('Authorization', token)
        .end((err, res) => {
            res.should.have.status(201);
            expect(res.body.message).to.include('A new meal has been created');
            res.body.data.should.have.property('id').which.is.a('number');
            res.body.data.should.have.property('isActive').which.is.a('boolean');
            res.body.data.should.have.property('isVega').which.is.a('boolean');
            res.body.data.should.have.property('isVegan').which.is.a('boolean');
            res.body.data.should.have.property('isToTakeHome').which.is.a('boolean');
            res.body.data.should.have.property('dateTime').which.is.a('string');
            res.body.data.should.have.property('maxAmountOfParticipants').which.is.a('number');
            res.body.data.should.have.property('price').which.is.a('number');
            res.body.data.should.have.property('imageUrl').which.is.a('string');
            res.body.data.should.have.property('cookId').which.is.a('number');
            res.body.data.should.have.property('createDate').which.is.a('string');
            res.body.data.should.have.property('updateDate').which.is.a('string');
            res.body.data.should.have.property('name').which.is.a('string');
            res.body.data.should.have.property('description').which.is.a('string');
            expect(res.body.data).to.have.property('allergenes').that.is.an('array');
            expect(res.body.data.allergenes[0]).to.be.equal('gluten');
            createdMealId = res.body.data.id
            done()
        })
    })
})

describe('UC-302 / Wijzigen van maaltijdsgegevens', () => {
    it('TC-302-1 / Verplicht velden “name” en/of “price”en/of “maxAmountOfParticipants” ontbreken', (done) => {
        const TC302_1_update = {            
            "price": 5.30,
            "name": "Spaghetti Bolognese"
        }
        chai
        .request(server)
        .put('/api/meal/2')
        .send(TC302_1_update)
        .set('Authorization', token)
        .end((err, res) => {
            res.should.have.status(400);
            expect(res.body.data).to.be.empty;
            expect(res.body.message).to.include('maxAmountOfParticipants');
            done()
        })
    })

    it('TC-302-2 / Niet ingelogd', (done) => {
        const TC302_2_update = {            
            "maxAmountOfParticipants": 8,
            "price": 5.30,
            "name": "Spaghetti Bolognese"
        }
        chai
        .request(server)
        .put('/api/meal/2')
        .send(TC302_2_update)
        .end((err, res) => {
            res.should.have.status(401);
            expect(res.body.data).to.be.empty;
            expect(res.body.message).to.include('User is not logged in');
            done()
        })
    })

    it('TC-302-3 / Niet de eigenaar van de data', (done) => {
        const TC302_3_update = {            
            "maxAmountOfParticipants": 8,
            "price": 5.30,
            "name": "Spaghetti Bolognese"
        }

        chai
        .request(server)
        .put('/api/meal/1')
        .send(TC302_3_update)
        .set('Authorization', token)
        .end((err, res) => {
            res.should.have.status(403);
            expect(res.body.data).to.be.empty;
            expect(res.body.message).to.include('User is not authorized to modify this meal');
            done()
        })
    })

    it('TC-302-4 / Maaltijd bestaat niet', (done) => {
        const TC302_4_update = {            
            "maxAmountOfParticipants": 8,
            "price": 5.30,
            "name": "Spaghetti Bolognese"
        }

        chai
        .request(server)
        .put('/api/meal/0')
        .send(TC302_4_update)
        .set('Authorization', token)
        .end((err, res) => {
            res.should.have.status(404);
            expect(res.body.data).to.be.empty;
            expect(res.body.message).to.include('No meal found');
            done()
        })
    })

    it('TC-302-5 / Maaltijd succesvol gewijzigd', (done) => {
        const TC302_5_update = {            
            "maxAmountOfParticipants": 8,
            "price": 5.30,
            "name": "Spaghetti Bolognese"
        }

        chai
        .request(server)
        .put('/api/meal/2')
        .send(TC302_5_update)
        .set('Authorization', token)
        .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.message).to.include('Updated meal');
            expect(res.body.data[0]).to.have.property('maxAmountOfParticipants').that.equals(8);
            expect(res.body.data[0]).to.have.property('price').that.equals('5.30');
            expect(res.body.data[0]).to.have.property('name').that.equals('Spaghetti Bolognese');
            done()
        })
    })
})

describe('UC-303 Opvragen van alle maaltijden', () => {
    it('TC-303-1 / Lijst van maaltijden geretourneerd', (done) => {
        chai
        .request(server)
        .get('/api/meal')
        .end((err, res) => {
            assert(err === null)
            res.should.have.status(200);
            res.body.data.should.be.an('array');
            res.body.data.should.have.lengthOf.at.least(2);
            done()
        })
    })
})

describe('UC-304 Opvragen van maaltijd bij ID', () => {
    it('TC-304-1 / Maaltijd bestaat niet', (done) => {
        chai
        .request(server)
        .get('/api/meal/0')
        .end((err, res) => {
            res.should.have.status(404);
            expect(res.body.data).to.be.empty;
            expect(res.body.message).to.include('No meal found');
            done()
        })
    })
    it('TC-304-2 / Details van maaltijd geretourneerd', (done) => {
        chai
        .request(server)
        .get('/api/meal/2')
        .end((err, res) => {
            res.should.have.status(200);
            expect(res.body.message).to.include('retrieved');
            res.body.data[0].should.have.property('id').which.is.a('number');
            res.body.data[0].should.have.property('isActive').which.is.a('boolean');
            res.body.data[0].should.have.property('isVega').which.is.a('boolean');
            res.body.data[0].should.have.property('isVegan').which.is.a('boolean');
            res.body.data[0].should.have.property('isToTakeHome').which.is.a('boolean');
            res.body.data[0].should.have.property('dateTime').which.is.a('string');
            res.body.data[0].should.have.property('maxAmountOfParticipants').which.is.a('number');
            res.body.data[0].should.have.property('price').which.is.a('string');
            res.body.data[0].should.have.property('imageUrl').which.is.a('string');
            res.body.data[0].should.have.property('cookId').which.is.a('number');
            res.body.data[0].should.have.property('createDate').which.is.a('string');
            res.body.data[0].should.have.property('updateDate').which.is.a('string');
            res.body.data[0].should.have.property('name').which.is.a('string');
            res.body.data[0].should.have.property('description').which.is.a('string');
            expect(res.body.data[0]).to.have.property('allergenes');
            done()
        })
    })
})

describe('UC-305 / Verwijderen van maaltijd ', () => {
    it('TC-305-1 / Niet ingelogd', (done) => {
        chai
        .request(server)
        .delete(`/api/meal/${createdMealId}`)
        .end((err, res) => {
            res.should.have.status(401);
            expect(res.body.data).to.be.empty;
            expect(res.body.message).to.include('User is not logged in');
            done()
        })
    })
    it('TC-305-2 / Niet de eigenaar van de data', (done) => {
        chai
        .request(server)
        .delete(`/api/meal/1`)
        .set('Authorization', token)
        .end((err, res) => {
            res.should.have.status(403);
            expect(res.body.data).to.be.empty;
            expect(res.body.message).to.include('User is not authorized to delete this meal');
            done()
        })
    })
    it('TC-305-3 / Maaltijd bestaat niet', (done) => {
        chai
        .request(server)
        .delete(`/api/meal/0`)
        .set('Authorization', token)
        .end((err, res) => {
            res.should.have.status(404);
            expect(res.body.data).to.be.empty;
            expect(res.body.message).to.include('No meal found');
            done()
        })
    })
    it('TC-305-4 / Maaltijd succesvol verwijderd', (done) => {
        chai
        .request(server)
        .delete(`/api/meal/${createdMealId}`)
        .set('Authorization', token)
        .end((err, res) => {
            res.should.have.status(200);
            expect(res.body.message).to.include('Deleted meal');
            expect(res.body.data).to.be.empty;
            done()
        })
    })
})