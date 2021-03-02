import request from 'supertest';
import { getConnection } from 'typeorm';

import app from '../app';
import createConnection from '../database';

describe('Surveys', () => {
  beforeAll(async () => {
    const connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    const connection = getConnection();
    await connection.dropDatabase();
    await connection.close();
  });

  it('Should be able to create a new survey', async () => {
    const response = await request(app).post('/surveys').send({
      title: 'Title Example',
      description: 'Describe survey to unit test',
    });

    expect(response.body).toHaveProperty('id');
    expect(response.status).toEqual(201);
  });

  it('Should be able to get all surveys', async () => {
    await request(app).post('/surveys').send({
      title: 'Title Example 2',
      description: 'Describe survey to unit test 2',
    });

    const response = await request(app).get('/surveys');

    expect(response.body.length).toEqual(2);
  });
});
