// tslint:disable-next-line: no-var-requires
require('module-alias/register');

import chai from 'chai';
// tslint:disable-next-line: import-name
import spies from 'chai-spies';
chai.use(spies);
import chaiHttp from 'chai-http';
import { Application } from 'express';
import { respositoryContext, testAppContext } from '../../mocks/app-context';

import { App } from '../../../src/server';

chai.use(chaiHttp);
const expect = chai.expect;
let expressApp: Application;

before(async () => {
  await respositoryContext.store.connect();
  const app = new App(testAppContext);
  app.initializeMiddlewares();
  app.initializeControllers();
  app.initializeErrorHandling();
  expressApp = app.expressApp;
});

describe('POST /todos', () => {
  it('should create a todo when non empty title passed ', async () => {
    const res = await chai
      .request(expressApp)
      .post('/todos')
      .send({
        title: 'Adding first title',
      });

    expect(res).to.have.status(201);
    expect(res.body).to.have.property('id');
    expect(res.body).to.have.property('title');
    expect(res.body.title).to.equal('Adding first title');
  });

  it('should return a validation error if title is empty string.', async () => {
    const res = await chai
      .request(expressApp)
      .post('/todos')
      .send({
        title: '',
      });

    expect(res).to.have.status(400);
    expect(res.body.failures).to.have.deep.members([{ field: 'title', message: 'Please provide a title.' }]);
  });
});
