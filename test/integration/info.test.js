const chai = require('chai')
const assert = require('assert')
const chaiHttp = require('chai-http') //start de server
const server = require('../../app')

chai.should()
chai.use(chaiHttp)

describe('Server-info', () => { //suite waar je meerdere testcases kan hebben
    it('TC-102- Server info', (done) => {// 1 testcase
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

    it('TC-103- Server should return error when the endpoint does not exist', (done) => {// 1 testcase
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
})