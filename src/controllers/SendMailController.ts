import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { resolve } from 'path';

import SurveysRepository from '../repositories/SurveysRepository';
import SurveysUserRepository from '../repositories/SurveysUserRepository';
import UsersRepository from '../repositories/UsersRepository';
import SendMailService from '../services/SendMailService';
class SendMailController {
  async execute(request: Request, response: Response) {
    const { email, survey_id } = request.body;

    const usersRepository = getCustomRepository(UsersRepository);
    const surveyRepository = getCustomRepository(SurveysRepository);
    const surveysUserRepository = getCustomRepository(SurveysUserRepository);

    const user = await usersRepository.findOne({ email });
    const survey = await surveyRepository.findOne({
      id: survey_id,
    });

    if (!user) {
      return response.status(400).json({
        error: 'User does not exists.',
      });
    }

    if (!survey) {
      return response.status(400).json({
        error: 'Survey does not exists.',
      });
    }

    const surveyUser = surveysUserRepository.create({
      user_id: user.id,
      survey_id,
    });

    await surveysUserRepository.save(surveyUser);

    const npsPath = resolve(__dirname, '..', 'views', 'emails', 'npsMail.hbs');

    const variables = {
      name: user.name,
      title: survey.title,
      description: survey.description,
    };

    await SendMailService.execute(email, survey.title, variables, npsPath);

    return response.status(201).json(surveyUser);
  }
}

export default SendMailController;
