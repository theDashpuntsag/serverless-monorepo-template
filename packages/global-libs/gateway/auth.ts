import type { APIGatewayProxyEvent } from 'aws-lambda';
import type { QueryParams, RequestMetadata } from '@custom-repo/global-types';
import { logger } from '../utils';

interface ExtendedAPIGatewayProxyEvent extends Omit<APIGatewayProxyEvent, 'body'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
}

const extractMetadata = (event: ExtendedAPIGatewayProxyEvent): RequestMetadata => {
  try {
    const ipAddress = event.requestContext.identity.sourceIp;
    const token = event.headers.Authorization?.replace('Bearer ', '');
    const queryParams = event.queryStringParameters as QueryParams;
    const headers = event.headers;
    const body = event.body;
    return { ipAddress, token, headers, queryParams, body };
  } catch (error) {
    logger.error('Err', error);
    throw new Error('Unable to process request!');
  }
};

export { extractMetadata };
