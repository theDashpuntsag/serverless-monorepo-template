import type { LbdFuncResponse } from '@custom-repo/global-types';
import type { APIGatewayProxyResultV2 } from 'aws-lambda';

import { ZodError } from 'zod';
import { formatApiResponse, formatResponse } from '../functions';
import { logger } from '../utils';
import CustomError from './custom-error';

function handleApiFuncError(error: unknown): APIGatewayProxyResultV2 {
  if (error instanceof Error) logger.error(`${error.message}`);
  if (error instanceof CustomError) return formatApiResponse({ error: { message: error.message } }, error.statusCode);
  if (error instanceof ZodError) return handleZodError(error);
  return formatApiResponse({ error: { message: 'Unexpected error occurred' } }, 500);
}

function handleDefaultError(error: unknown): LbdFuncResponse {
  if (error instanceof Error) logger.error(`Function Error occurred: ${error.message}`);
  if (error instanceof CustomError) return formatResponse({ error: { message: error.message } }, error.statusCode);
  if (error instanceof ZodError) return handleZodFuncError(error);
  return formatResponse({ error: { message: 'Unexpected error occurred' } }, 500);
}

function handleZodError(error: ZodError): APIGatewayProxyResultV2 {
  const missingFields = error.issues.map((err) => err.path.join('.') || 'unknown field');
  const formattedMessage = `Missing or invalid fields: ${missingFields.join(', ')}`;
  return formatApiResponse({ error: { message: formattedMessage } }, 400);
}

function handleZodFuncError(error: ZodError): LbdFuncResponse {
  const missingFields = error.issues.map((err) => err.path.join('.') || 'unknown field');
  const formattedMessage = `Missing or invalid fields: ${missingFields.join(', ')}`;
  return formatResponse({ error: { message: formattedMessage } }, 400);
}

export { handleApiFuncError, handleDefaultError };
