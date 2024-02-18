import { BaseService } from '../baseService';
import { IPeriodData } from '../../models/periodData';
import { ModelName } from '../../models/enums/modelName';
import { UploadService } from './uploadService';
import { IPersonalHealthQueryResponse } from '../../models/personalHealthQuery';
import moment, { Moment } from 'moment-timezone';
import { createError } from '../../utils/response';
import { getUpdateOptions } from '../../utils/utils';

export class PeriodDataService extends BaseService<IPeriodData> {
  uploadService: UploadService;

  constructor() {
    super(ModelName.PERIOD_DATA);
    this.uploadService = new UploadService();
  }

  async _create(
    user: string,
    responses: IPersonalHealthQueryResponse[],
    timezone: string
  ): Promise<IPeriodData> {
    const period = await super.findOne({ user });
    let periodDatesResponse = this.getResponseItem('period dates', responses);
    if (periodDatesResponse.answers.length === 0)
      throw createError('Please provide last period start dates', 400);
    if (period) {
      return await this.updatePeriodDates(
        user,
        {
          periodDates: periodDatesResponse.answers[0],
        },
        timezone
      );
    }
    console.log('>>> Period dates response: ', periodDatesResponse, timezone);
    let answerIsoDates = periodDatesResponse.answers[0].split(',');
    let periodDateMoments: Moment[] = answerIsoDates.map((value) =>
      moment.tz(value, timezone)
    );
    let periodData = Object.assign(
      await this.calculateMenstrualDates(periodDateMoments),
      { user, responses }
    );
    let date = periodData.date;
    console.log('>>> Period date: ', date);
    return await super.updateByOne(
      { user, date },
      {
        $set: periodData,
      },
      getUpdateOptions()
    );
  }

  public async updatePeriodDates(
    user: string,
    body: {
      periodDates: string;
    },
    timezone
  ): Promise<IPeriodData> {
    let previousPeriodData = await super.findOne({ user });
    let answerIsoDates = body.periodDates.split(',');
    let periodDateMoments: Moment[] = answerIsoDates.map((value) =>
      moment.tz(value, timezone)
    );
    Object.assign(
      previousPeriodData,
      await this.calculateMenstrualDates(periodDateMoments)
    );
    let date = previousPeriodData.date;
    console.log('>>>> New period date: ', date);
    return await super.updateByOne(
      { user, date },
      {
        $set: previousPeriodData,
      },
      getUpdateOptions()
    );
  }

  public async calculateMenstrualDates(
    periodDateMoments: Moment[]
  ): Promise<IPeriodData> {
    const periodDateMoment = periodDateMoments[0];
    const nextPeriodMoment = periodDateMoment.clone().add(1, 'month');
    const nextOvulationMoment = nextPeriodMoment.clone().subtract(14, 'days');
    let periodDates: Date[] = periodDateMoments
      .filter((value) => value.isValid())
      .map((value) => value.toDate());
    if (periodDates.length === 0) {
      throw createError('Unable to determine period dates', 400);
    }

    const nextOvulationDates: Date[] = [
      nextOvulationMoment.toDate(),
      nextOvulationMoment.clone().add(1, 'day').toDate(),
      nextOvulationMoment.clone().add(2, 'day').toDate(),
      nextOvulationMoment.clone().add(3, 'day').toDate(),
      nextOvulationMoment.clone().add(4, 'day').toDate(),
      nextOvulationMoment.clone().add(4, 'day').toDate(),
    ];
    // console.log('>>> Period dates: ', periodDates);
    // console.log('>>> Next ovulation dates: ', nextOvulationDates);
    // console.log(
    //   '>>> Period date: ',
    //   periodDateMoment.clone().startOf('month').toISOString(true)
    // );
    let date = periodDateMoment.clone().utc().startOf('month');
    return {
      date: date.toDate(),
      periodDate: periodDateMoment.toDate(),
      nextOvulationDate: nextOvulationMoment.toDate(),
      nextPeriodDate: nextPeriodMoment.toDate(),
      periodDates: periodDates,
      nextOvulationDates: nextOvulationDates,
    } as IPeriodData;
  }

  getResponseItem(
    questionLike: string,
    responses: IPersonalHealthQueryResponse[]
  ): IPersonalHealthQueryResponse {
    let response = responses.find((value) =>
      value.question.toLowerCase().includes(questionLike)
    );
    if (!response)
      throw createError(
        'Unable to create period data. Response not found',
        400
      );
    return response;
  }
}
