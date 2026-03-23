import type { AWS } from '@serverless/typescript';
import 'dotenv/config';
import { APIS_EXAMPLE } from './src/functions/api/example';

const EXAMPLE_TABLE_NAME = '${self:service}-${sls:stage}-example-table';

const serverlessConfig: AWS = {
  service: 'service-name',
  frameworkVersion: '4',
  app: 'app-name',
  plugins: ['serverless-offline', 'serverless-prune-plugin'],
  provider: {
    name: 'aws',
    stage: "${opt:stage, 'dev'}",
    runtime: 'nodejs24.x',
    region: 'ap-southeast-1',
    profile: '',
    timeout: 29,
    memorySize: 512,
    architecture: 'arm64',
    deploymentBucket: {
      blockPublicAccess: true,
    },
    apiGateway: {
      minimumCompressionSize: 1024, // Compress responses larger than 1KB
      shouldStartNameWithService: true, // Include the service name in API Gateway endpoint URLs
      usagePlan: {
        throttle: {
          burstLimit: 150, // Maximum number of requests per second
          rateLimit: 100, // Average number of requests per second
        },
      },
    },
    logRetentionInDays: 365,
    environment: {
      EXAMPLE_TABLE_NAME,
    },
    iam: { role: process.env.AWS_IAM_ROLE! },
  },
  functions: {
    ...APIS_EXAMPLE,
  },
  resources: {
    Resources: {
      ExampleTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: EXAMPLE_TABLE_NAME,
          BillingMode: 'ON_DEMAND',
          AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'status', AttributeType: 'S' },
            { AttributeName: 'createdAt', AttributeType: 'N' },
          ],
          KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
          GlobalSecondaryIndexes: [
            {
              IndexName: 'status-createdAt-index',
              KeySchema: [
                { AttributeName: 'status', KeyType: 'HASH' },
                { AttributeName: 'createdAt', KeyType: 'RANGE' },
              ],
              Projection: { ProjectionType: 'ALL' },
            },
          ],
        },
      },
    },
  },
  package: { individually: true },
  custom: { prune: { automatic: true, number: 2 } },
};

export default serverlessConfig;
