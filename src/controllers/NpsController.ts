import { getCustomRepository, Not, IsNull } from 'typeorm';
import { Request, Response } from 'express';
import SurveysUserRepository from '../repositories/SurveysUserRepository';

class NpsController {
  async execute(request: Request, response: Response) {
    const { survey_id } = request.params;
    const surveysUserRepository = getCustomRepository(SurveysUserRepository);

    const surveysUsers = await surveysUserRepository.find({
      survey_id,
      value: Not(IsNull()),
    });

    const detractors = surveysUsers.filter(
      (survey) => survey.value >= 0 && survey.value <= 6
    ).length;

    const promoters = surveysUsers.filter(
      (survey) => survey.value >= 9 && survey.value <= 10
    ).length;

    const passives = surveysUsers.filter(
      (survey) => survey.value >= 7 && survey.value <= 8
    ).length;

    const totalAnswers = surveysUsers.length;

    const calculateNps = Number(
      (((promoters - detractors) / totalAnswers) * 100).toFixed(2)
    );

    return response.json({
      detractors,
      promoters,
      passives,
      totalAnswers,
      nps: calculateNps,
    });
  }
}

export default NpsController;
