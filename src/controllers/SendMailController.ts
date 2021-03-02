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

    const surveyUserAlreadyExists = await surveysUserRepository.findOne({
      where: [{ user_id: user.id, value: null }],
      relations: ['user', 'survey'],
    });

    const variables = {
      name: user.name,
      title: survey.title,
      description: survey.description,
      id: '',
      link: process.env.URL_MAIL,
    };

    const npsPath = resolve(__dirname, '..', 'views', 'emails', 'npsMail.hbs');

    if (surveyUserAlreadyExists) {
      variables.id = surveyUserAlreadyExists.id;
      await SendMailService.execute(email, survey.title, variables, npsPath);
      return response.json(surveyUserAlreadyExists);
    }

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

    variables.id = surveyUser.id;

    await surveysUserRepository.save(surveyUser);

    await SendMailService.execute(email, survey.title, variables, npsPath);

    return response.status(201).json(surveyUser);
  }
}

export default SendMailController;
