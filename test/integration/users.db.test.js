const chai = require('chai')
const assert = require('assert')
const chaiHttp = require('chai-http') //start de server
const server = require('../../app')
const expect = chai.expect;

chai.should()
chai.use(chaiHttp)

let id;
let token;
let tokenToDelete;

describe('UC-201 / Registeren als nieuwe user', () => {
    it('TC-201-1 / Verplicht veld ontbreekt', (done) => {
        const TC201_1_user = {
            "firstName": "Svensa",
            "lastName": "Husa",
            "password": "hisetsa",
            "phoneNumber": "0624275190",
            "street": "mesdagstraat",
            "city": "Zwijndrecht"
        }

        chai
        .request(server)
        .post('/api/user')
        .send(TC201_1_user)
        .end((err, res) => {
            res.should.have.status(400);
            expect(res.body.data).to.be.empty;
            expect(res.body.message).to.include('emailAdress');
            done()
        })
    })
    it('TC-201-2 / Niet-valide emailadres', (done) => {
        const TC201_2_user = {
            "firstName": "Svense",
            "lastName": "Husa",
            "emailAdress": "nietvalideemail",
            "password": "hisets",
            "phoneNumber": "0624275191",
            "street": "mesdagstraat",
            "city": "Zwijndrecht"
        }

        chai
        .request(server)
        .post('/api/user')
        .send(TC201_2_user)
        .end((err, res) => {
            res.should.have.status(400);
            expect(res.body.data).to.be.empty;
            expect(res.body.message).to.include('emailAdress');
            done()
        })
    })
    it('TC-201-3 / Niet-valide wachtwoord', (done) => {
        const TC201_3_user = {
            "firstName": "Svens",
            "lastName": "Hus",
            "emailAdress": "svenhusom@live.nl",
            "password": "hi",
            "phoneNumber": "0624275192",
            "street": "mesdagstraat",
            "city": "Zwijndrecht"
        }

        chai
        .request(server)
        .post('/api/user')
        .send(TC201_3_user)
        .end((err, res) => {
            res.should.have.status(400);
            expect(res.body.data).to.be.empty;
            expect(res.body.message).to.include('password');
            done()
        })
    })
    it('TC-201-4 / Gebruiker bestaat al', (done) => {
        const TC201_4_user = {
            "firstName": "Mariëtte",
            "lastName": "van den Dullemen",
            "emailAdress": "m.vandullemen@server.nl",
            "password": "secret",
            "phoneNumber": "0624275193",
            "street": "mesdagstraat",
            "city": "Zwijndrecht"
        }

        chai
        .request(server)
        .post('/api/user')
        .send(TC201_4_user)
        .end((err, res) => {
            res.should.have.status(403);
            expect(res.body.data).to.be.empty;
            expect(res.body.message).to.include('exists');
            done()
        })
    })
    it('TC-201-5 / Gebruiker succesvol geregistreerd', (done) => {
        const TC201_5_user = {
            "firstName": "Sven",
            "lastName": "Hu",
            "emailAdress": "svenhu@live.nl",
            "password": "secret",
            "phoneNumber": "0624275193",
            "street": "mesdagstraat",
            "city": "Zwijndrecht"
        }

        chai
        .request(server)
        .post('/api/user')
        .send(TC201_5_user)
        .end((err, res) => {
            assert(err === null)
            res.should.have.status(201);
            res.body.data.should.have.property('id');
            res.body.data.should.have.property('firstName', TC201_5_user.firstName);
            res.body.data.should.have.property('lastName', TC201_5_user.lastName);
            res.body.data.should.have.property('emailAdress', TC201_5_user.emailAdress);
            res.body.data.should.have.property('password', TC201_5_user.password);
            res.body.data.should.have.property('phoneNumber', TC201_5_user.phoneNumber);
            res.body.data.should.have.property('street', TC201_5_user.street);
            res.body.data.should.have.property('city', TC201_5_user.city);
            done()
        })
    })
})

describe('UC-202 / Opvragen van overzicht van users', () => {
    it('TC-202-1 / Toon alle gebruikers (minimaal 2)', (done) => {    
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
    it('TC-202-2 / Toon gebruikers met zoekterm op niet-bestaande velden', (done) => {        
        const TC202_2_filter = {
            "test1": "true",
            "test2": "3"
        }
        
        chai
        .request(server)
        .get('/api/user')
        .send(TC202_2_filter)
        .end((err, res) => {
            assert(err === null)
            res.should.have.status(200);
            res.body.data.should.be.an('array');
            res.body.data.should.have.lengthOf.at.least(2);
            done()
        })
    })
    it('TC-202-3 / Toon gebruikers met gebruik van de zoekterm op het veld ‘isActive’=false', (done) => {        
        const TC202_3_filter = {
            "isActive": "false"
        }
        
        chai
        .request(server)
        .get('/api/user')
        .send(TC202_3_filter)
        .end((err, res) => {
            assert(err === null)
            res.should.have.status(200);
            res.body.data.should.be.an('array');
            res.body.data.should.have.lengthOf.at.least(2);
            done()
        })
    })
    it('TC-202-4 / Toon gebruikers met gebruik van de zoekterm op het veld ‘isActive’=true', (done) => {        
        const TC202_4_filter = {
            "isActive": "true"
        }
        
        chai
        .request(server)
        .get('/api/user')
        .send(TC202_4_filter)
        .end((err, res) => {
            assert(err === null)
            res.should.have.status(200);
            res.body.data.should.be.an('array');
            res.body.data.should.have.lengthOf.at.least(2);
            done()
        })
    })
    it('TC-202-5 / Toon gebruikers met zoektermen op bestaande velden (max op 2 velden filteren)', (done) => {        
        const TC202_5_filter = {
            "isActive": "true",
            "firstName": "Sven"
        }
        
        chai
        .request(server)
        .get('/api/user')
        .send(TC202_5_filter)
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
    it('TC-203-1 / Ongeldig token', (done) => {
        chai
        .request(server)
        .get('/api/user/profile')
        .end((err, res) => {
            res.should.have.status(401);
            expect(res.body.message).to.include('User is not logged in');
            expect(res.body.data).to.be.empty;
            done()
        })
    })

    it('TC-203-2 / Gebruiker is ingelogd met geldig token', (done) => {
        const TC203_1_login = {
            "emailAdress": "m.vandullemen@server.nl",
            "password": "secret"
        }

        chai
        .request(server)
        .post('/api/login')
        .send(TC203_1_login)
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
            token = res.body.data.token;
            assert(token !== null)
            chai
            .request(server)
            .get('/api/user/profile')
            .set('Authorization', token)
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
})

describe('UC-204 / Opvragen van usergegevens bij ID', () => {
    it('TC-204-1 / Ongeldig token', (done) => {
        chai
        .request(server)
        .get('/api/user/1')
        .end((err, res) => {
            res.should.have.status(401);
            expect(res.body.message).to.include('User is not logged in');
            expect(res.body.data).to.be.empty;
            done()
        })
    })
    it('TC-204-2 / Gebruiker-ID bestaat niet', (done) => {
        chai
        .request(server)
        .get('/api/user/0')
        .set('Authorization', token)
        .end((err, res) => {
            res.should.have.status(404);
            expect(res.body.message).to.include('No user found');
            expect(res.body.data).to.be.empty;
            done()
        })
    })
    it('TC-204-3 / Gebruiker-ID bestaat', (done) => {
        chai
        .request(server)
        .get('/api/user/1')
        .set('Authorization', token)
        .end((err, res) => {
            assert(err === null)
            res.should.have.status(200);
            res.body.data.user[0].should.have.property('id');
            res.body.data.user[0].should.have.property('firstName');
            res.body.data.user[0].should.have.property('lastName');
            res.body.data.user[0].should.have.property('emailAdress');
            res.body.data.user[0].should.have.property('password');
            res.body.data.user[0].should.have.property('phoneNumber');
            res.body.data.user[0].should.have.property('street');
            res.body.data.user[0].should.have.property('city');
            done()
        })
    })
})

describe('UC-205 / Updaten van usergegevens', () => {
    it('TC-205-1 / Verplicht veld “emailAddress” ontbreekt', (done) => {
        const TC205_1_login = {
            "password": "hilias"
        }

        chai
        .request(server)
        .put('/api/user/1')
        .send(TC205_1_login)
        .set('Authorization', token)
        .end((err, res) => {
            res.should.have.status(400);
            expect(res.body.message).to.include('emailAdress');
            expect(res.body.data).to.be.empty;
            done()
        })
    })

    it('TC-205-1 / Verplicht veld “emailAddress” ontbreekt', (done) => {
        const TC205_1_update = {
            "password": "hilias"
        }

        chai
        .request(server)
        .put('/api/user/1')
        .send(TC205_1_update)
        .set('Authorization', token)
        .end((err, res) => {
            res.should.have.status(400);
            expect(res.body.message).to.include('emailAdress');
            expect(res.body.data).to.be.empty;
            done()
        })
    })

    it('TC-205-2 / De gebruiker is niet de eigenaar van de data', (done) => {
        const TC205_2_update = {
            "emailAdress": "UwUOwO@Live.nl",
            "password": "hilias"
        }

        chai
        .request(server)
        .put('/api/user/2')
        .send(TC205_2_update)
        .set('Authorization', token)
        .end((err, res) => {
            res.should.have.status(403);
            expect(res.body.message).to.include('User is not authorized to modify this account');
            expect(res.body.data).to.be.empty;
            done()
        })
    })

    it('TC-205-3 / Niet-valide telefoonnummer', (done) => {
        const TC205_3_update = {
            "emailAdress": "UwUOwO@Live.nl",
            "phoneNumber": "023939134823489",
            "password": "hilias"
        }

        chai
        .request(server)
        .put('/api/user/1')
        .send(TC205_3_update)
        .set('Authorization', token)
        .end((err, res) => {
            res.should.have.status(400);
            expect(res.body.message).to.include('phoneNumber');
            expect(res.body.data).to.be.empty;
            done()
        })
    })

    it('TC-205-4 / Gebruiker bestaat niet', (done) => {
        const TC205_4_update = {
            "emailAdress": "UwUOwO@Live.nl",
            "password": "hilias"
        }

        chai
        .request(server)
        .put('/api/user/0')
        .send(TC205_4_update)
        .set('Authorization', token)
        .end((err, res) => {
            res.should.have.status(404);
            expect(res.body.message).to.include('No user found');
            expect(res.body.data).to.be.empty;
            done()
        })
    })

    it('TC-205-5 / Niet ingelogd', (done) => {
        const TC205_5_update = {
            "emailAdress": "UwUOwO@Live.nl",
            "password": "hilias"
        }

        chai
        .request(server)
        .put('/api/user/1')
        .send(TC205_5_update)
        .end((err, res) => {
            res.should.have.status(401);
            expect(res.body.message).to.include('User is not logged in');
            expect(res.body.data).to.be.empty;
            done()
        })
    })

    it('TC-205-6 / Gebruiker succesvol gewijzigd', (done) => {
        const TC205_6_update = {
            "emailAdress": "UwUOwO@Live.nl",
            "password": "hilias"
        }

        chai
        .request(server)
        .put('/api/user/1')
        .send(TC205_6_update)
        .set('Authorization', token)
        .end((err, res) => {
            res.should.have.status(200);
            expect(res.body.message).to.include('Updated user');
            expect(res.body.data).to.be.empty;
            done()
        })
    })
})

describe('UC-206 / Verwijderen van user', () => {
    it('TC-206-1 / Gebruiker bestaat niet', (done) => {
        const TC201_5_delete = {
            "emailAdress": "svenhu@live.nl",
            "password": "secret"
        }
        chai
        .request(server)
        .post('/api/login')
        .send(TC201_5_delete)
        .end((err, res) => {
            tokenToDelete = res.body.data.token;
            id = res.body.data.id;
            chai
            .request(server)
            .delete(`/api/user/0`)
            .set('Authorization', tokenToDelete)
            .end((err, res) => {
                res.should.have.status(404);
                expect(res.body.message).to.include('user');
                expect(res.body.data).to.be.empty;
                done()
            })
        })
    })
    it('TC-206-2 / Gebruiker is niet ingelogd', (done) => {
        chai
        .request(server)
        .delete(`/api/user/${id}`)
        .end((err, res) => {
            res.should.have.status(401);
            expect(res.body.message).to.include('User is not logged in');
            expect(res.body.data).to.be.empty;
            done()
        })
    })
    it('TC-206-3 / De gebruiker is niet de eigenaar van de data', (done) => {
        chai
        .request(server)
        .delete(`/api/user/1`)
        .set('Authorization', tokenToDelete)
        .end((err, res) => {
            res.should.have.status(403);
            expect(res.body.message).to.include('User is not authorized to delete this');
            expect(res.body.data).to.be.empty;
            done()
        })
    })
    it('TC-206-4 / Gebruiker succesvol verwijderd', (done) => {
        chai
        .request(server)
        .delete(`/api/user/${id}`)
        .set('Authorization', tokenToDelete)
        .end((err, res) => {
            res.should.have.status(200);
            expect(res.body.message).to.include('Deleted user');
            expect(res.body.data).to.be.empty;
            done()
        })
    })
})

describe('UC-XXX / Fix data', () => {
    it('TC-xxx-x / Gebruiker id 1 email adress reverten', (done) => {
        const TCxxx_x_update = {
            "emailAdress": "m.vandullemen@server.nl",
            "password": "secret"
        }

        chai
        .request(server)
        .put('/api/user/1')
        .send(TCxxx_x_update)
        .set('Authorization', token)
        .end((err, res) => {
            res.should.have.status(200);
            done()
        })
    })
})