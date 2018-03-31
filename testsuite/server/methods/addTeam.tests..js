/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Random } from 'meteor/random'
import { $ } from 'meteor/jquery';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai'
import moment from 'moment'
import { Teams } from '../../../imports/lib/pairity'
import { Logger } from '../../../imports/lib/logger'

import { TestData } from '../../testData'

const should = chai.should();
chai.use(sinonChai);

if (Meteor.isServer) {
    import '../../../imports/server/publications/publication-teams'

    describe('Add Team Method', function () {
        let userId
        let sandbox
        let subject

        beforeEach(function () {
            sandbox = sinon.createSandbox()
            userId = Random.id()
            subject = Meteor.server.method_handlers.createAuthor;
        });

        afterEach(function () {
            Teams.remove({})
            sandbox.restore()
        })

        it('must be logged in', function () {
            const context = {};
            let msg = '';

            try {
                const resultId = subject.apply(context, TestData.fakeTeam());
            } catch (error) {
                msg = error.message;
            }

            expect(msg, 'should throw not logged in').to.be.equal('You must be authenticated to perform this action! [not-logged-in]');
        })

        it('checks for dups', function () {
            const context = { userId: userId };
            let msg = '';
            const fakeTeam = TestData.fakeTeam()
            // console.log(fakeTeam)
            sandbox.stub(Teams, 'findOne').returns(fakeTeam)

            try {
                const resultId = subject.apply(context, [fakeTeam]);
            } catch (error) {
                msg = error.message;
            }

            expect(msg, 'should throw dup error').to.be.equal('Team name is not available! [duplicate-found]');
        })

        it('inserts new author correctly - stubbed', function () {
            const context = { userId: userId };
            let msg = '';
            const newId = Random.id()
            let resultId = ''
            const fakeTeam = TestData.fakeTeam()
            sandbox.stub(Teams, 'findOne').returns(null)
            sandbox.stub(Teams, 'insert').returns(newId)

            try {
                resultId = subject.apply(context, [fakeTeam]);
            } catch (error) {
                msg = error.message;
            }

            expect(resultId).to.equal(newId)

            const params = Teams.insert.args[0][0]
            expect(params.name).to.equal(fakeTeam.name)
            expect(params.description).to.equal(fakeTeam.description)
            expect(params.birthDate).to.equal(fakeTeam.birthDate)
            expect(params.deathDate).to.equal(fakeTeam.deathDate)
            expect(params.comments).to.equal(fakeTeam.comments)
            expect(params.createdBy).to.equal(fakeTeam.createdBy)
        })

        it('handles insert error correctly', function () {
            const context = { userId: userId };
            let msg = '';
            const newId = Random.id()
            let resultId = ''
            const fakeTeam = TestData.fakeTeam()
            sandbox.stub(Teams, 'findOne').returns(null)
            sandbox.stub(Teams, 'insert').throws(TestData.fakeError())
            sandbox.stub(Logger, 'log')

            try {
                resultId = subject.apply(context, [fakeTeam]);
            } catch (error) {
                msg = error.reason;
            }

            expect(Logger.log).to.have.been.called
            expect(msg).to.equal('Author not created - please try again later!')
        })
    })
}