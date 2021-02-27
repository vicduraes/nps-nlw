import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';

import SurveysRepository from '../repositories/SurveysRepository';

class SurveyController {
  async create(request: Request, response: Response) {
    const surveysRepository = getCustomRepository(SurveysRepository);

    const { title, description } = request.body;

    const survey = surveysRepository.create({
      title,
      description,
    });

    await surveysRepository.save(survey);

    return response.status(201).json(survey);
  }

  async show(request: Request, response: Response) {
    const surveysRepository = getCustomRepository(SurveysRepository);

    const getAll = await surveysRepository.find();

    return response.json(getAll);
  }
}

export default SurveyController;
