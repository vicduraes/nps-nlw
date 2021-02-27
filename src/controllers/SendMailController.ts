import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import SurveysRepository from '../repositories/SurveysRepository';
import SurveysUserRepository from '../repositories/SurveysUserRepository';
import UsersRepository from '../repositories/UsersRepository';
class SendMailController {
  async execute(request: Request, response: Response) {
    const { email, survey_id } = request.body;

    const usersRepository = getCustomRepository(UsersRepository);
    const surveyRepository = getCustomRepository(SurveysRepository);
    const surveysUserRepository = getCustomRepository(SurveysUserRepository);

    const userAlreadyExists = await usersRepository.findOne({ email });
    const surveyAlreadyExists = await surveyRepository.findOne({
      id: survey_id,
    });

    if (!userAlreadyExists) {
      return response.status(400).json({
        error: 'User does not exists.',
      });
    }

    if (!surveyAlreadyExists) {
      return response.status(400).json({
        error: 'Survey does not exists.',
      });
    }

    const surveyUser = surveysUserRepository.create({
      user_id: userAlreadyExists.id,
      survey_id,
    });

    await surveysUserRepository.save(surveyUser);

    return response.status(201).json(surveyUser);
  }
}

export default SendMailController;
