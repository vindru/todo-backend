// tslint:disable-next-line: no-var-requires
require("module-alias/register");

import chai from "chai";
// tslint:disable-next-line: import-name
import spies from "chai-spies";
chai.use(spies);
import chaiHttp from "chai-http";
import { Application } from "express";
import { respositoryContext, testAppContext } from "../../mocks/app-context";

import { App } from "../../../src/server";

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

describe("POST /todos", () => {
  it("should create a todo when non empty title passed ", async () => {
    const res = await chai.request(expressApp).post("/todos").send({
      title: "Adding first title",
    });

    expect(res).to.have.status(201);
    expect(res.body).to.have.property("id");
    expect(res.body).to.have.property("title");
    expect(res.body.title).to.equal("Adding first title");
  });

  it("should return a validation error if title is empty string.", async () => {
    const res = await chai.request(expressApp).post("/todos").send({
      title: "",
    });

    expect(res).to.have.status(400);
    expect(res.body.failures).to.have.deep.members([
      { field: "title", message: "Please provide a title." },
    ]);
  });
});

describe("PUT /todos/:id", () => {
  it("should return a validation error if title is empty string.", async () => {
    const resCreate = await chai.request(expressApp).post("/todos").send({
      title: "Adding first title",
    });

    const res = await chai
      .request(expressApp)
      .put(`/todos/${resCreate.body.id}`)
      .send({
        title: "",
      });
    expect(res).to.have.status(400);
    expect(res.body.failures).to.have.deep.members([
      { field: "title", message: "Please provide a title." },
    ]);
  });

  it("should return 404 if id is empty.", async () => {
    const res = await chai.request(expressApp).put("/todos/");
    expect(res).to.have.status(404);
  });

  it("should return 204 if todo id exists", async () => {
    const resCreate = await chai.request(expressApp).post("/todos").send({
      title: "Adding first title",
    });

    const resUpdate = await chai
      .request(expressApp)
      .put(`/todos/${resCreate.body.id}`)
      .send({
        title: "Updated title",
      });
    expect(resUpdate).to.have.status(200);
    expect(resUpdate.body.title).to.equal("Updated title");
  });

  it("should return 404 if todo id dont exists", async () => {
    const resCreate = await chai.request(expressApp).post("/todos").send({
      title: "Adding first title",
    });

    await chai.request(expressApp).delete(`/todos/${resCreate.body.id}`);
    const resUpdated = await chai
      .request(expressApp)
      .put(`/todos/${resCreate.body.id}`);
    expect(resUpdated).to.have.status(404);
  });
});
