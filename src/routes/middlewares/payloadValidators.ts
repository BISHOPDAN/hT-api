import { IHealthGuide } from '../../models/healthGuide';
import { createError, ErrorStatus } from '../../utils/response';
import * as yup from 'yup';
import { NextFunction, Request, Response } from 'express';
import {
  IPersonalHealthQuery,
  IPersonalHealthQueryResponse,
} from '../../models/personalHealthQuery';
import { Gender } from '../../models/enums/generalEnum';
import { IHealthChoice } from '../../models/health-choice-item.schema';
import { HealthChoiceItem } from '../../models/enums/health-choice-item.enum';
import { HealthEntity } from '../../models/enums/health-choice-entity.enum';

export const healthGuideValidationHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const payload = req.body;
  console.log('Validating health guide: ', payload);
  const schema = yup.object<IHealthGuide>().shape({
    title: yup.string().required('Title is required'),
    entity: yup.mixed<HealthEntity>().oneOf(Object.values(HealthEntity)),
    benefits: yup
      .array()
      .of(
        yup.object().shape({
          title: yup.string().trim().required('Benefit title is required'),
          description: yup
            .string()
            .trim()
            .required('Benefit description is required'),
        })
      )
      .min(1)
      .required('Benefits is required'),
  });
  const errors = await validate(schema, payload);
  if (errors) {
    next(createError(errors, 400, ErrorStatus.FAILED));
  } else {
    next();
  }
};

export const healthChoiceValidationHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const payload = req.body;
  console.log('Validating health choice: ', payload);
  const schema = yup.object<IHealthChoice>().shape({
    title: yup.string().required(),
    item: yup.mixed<HealthChoiceItem>().oneOf(Object.values(HealthChoiceItem)),
    parentEntities: yup
      .array()
      .of(yup.mixed<HealthEntity>().oneOf(Object.values(HealthEntity)))
      .min(1)
      .required(),
  });
  const errors = await validate(schema, payload);
  if (errors) {
    next(createError(errors, 400, ErrorStatus.FAILED));
  } else {
    next();
  }
};

export const healthChoiceMultiValidationHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const payload = req.body;
  console.log('Validating health choice: ', payload);
  const schema = yup.object<IHealthChoice>().shape({
    titles: yup.array(yup.string().required()).required().min(1),
    item: yup.mixed<HealthChoiceItem>().oneOf(Object.values(HealthChoiceItem)),
    parentEntities: yup
      .array()
      .of(yup.mixed<HealthEntity>().oneOf(Object.values(HealthEntity)))
      .min(1)
      .required(),
  });
  const errors = await validate(schema, payload);
  if (errors) {
    next(createError(errors, 400, ErrorStatus.FAILED));
  } else {
    next();
  }
};

export const personalHealthQueryValidationHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const payload = req.body;
  // console.log(
  //   'Validating health query: ',
  //   util.inspect(payload, true, 5, true)
  // );
  const responsesSchema = yup.object<IPersonalHealthQueryResponse>().shape({
    question: yup.string().trim().required(),
    answers: yup.array(yup.string()),
  });
  const schema = yup.object<IPersonalHealthQuery>().shape({
    entity: yup
      .mixed<HealthEntity>()
      .oneOf(Object.values(HealthEntity))
      .required(),
    forSelf: yup.boolean(),
    userInfo: yup.object().shape({
      age: yup.string(),
      weight: yup.string(),
      height: yup.string(),
      gender: yup.mixed<Gender>().oneOf(Object.values(Gender)),
    }),
    responses: yup.array(responsesSchema),
  });
  const errors = await validate(schema, payload);
  if (errors) {
    next(createError(errors, 400, ErrorStatus.FAILED));
  } else {
    next();
  }
};

const validate = async (
  schema: yup.ObjectSchema<any>,
  payload
): Promise<string | null | undefined> => {
  try {
    await schema.validate(payload, { abortEarly: false });
    return null;
  } catch (e) {
    const errors = e.errors.join(', ');
    console.error('Validation errors: ', errors);
    return errors;
  }
};
