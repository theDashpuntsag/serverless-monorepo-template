# Serverless Monorepo Template

This repository is a pnpm + Turbo monorepo for building AWS Serverless stacks with shared internal packages.

The main design goal is:

1. Keep stack-level business logic clean.
2. Move repeated boilerplate into shared packages.
3. Enforce a predictable flow for Lambda code:
   Function definition -> Handler -> Service -> Repository -> DynamoDB.

## Quick Summary

- Runtime: Node.js 24 on AWS Lambda
- Framework: Serverless Framework v4
- Language: TypeScript (strict mode)
- Monorepo: pnpm workspaces + Turbo tasks
- API wrapper: middy + shared HTTP handler factory in libs package
- Data layer: DynamoDB clients and command builders

## Current Folder Structure

The structure below reflects the current project state.

```text
.
├── README.md
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── turbo.json
├── packages
│   ├── axios
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── axios.ts
│   │       ├── error.ts
│   │       ├── headers.ts
│   │       └── index.ts
│   ├── lambda
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── index.ts
│   │       └── lambda-invoke.ts
│   ├── libs
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── index.ts
│   │       ├── error
│   │       │   ├── custom-error.ts
│   │       │   ├── error-handling.ts
│   │       │   └── index.ts
│   │       ├── functions
│   │       │   ├── api-event.ts
│   │       │   ├── api-event.types.ts
│   │       │   ├── api-function.types.ts
│   │       │   ├── function-define.ts
│   │       │   ├── function-gateway.ts
│   │       │   ├── function.types.ts
│   │       │   └── index.ts
│   │       └── utility
│   │           ├── env.ts
│   │           ├── index.ts
│   │           ├── number.ts
│   │           ├── omit.ts
│   │           ├── response-format.ts
│   │           ├── uuid.ts
│   │           └── winston.ts
│   ├── schemas
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── index.ts
│   │       └── main
│   │           ├── index.ts
│   │           └── util.types.ts
│   ├── ssm
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── index.ts
│   │       └── ssm-client.ts
│   └── ts-configs
│       ├── base.json
│       └── package.json
└── stacks
		└── example
				├── env.ts
				├── eslint.config.mts
				├── package.json
				├── serverless.ts
				├── tsconfig.json
				├── scripts
				│   └── deploy.sh
				└── src
						├── functions
						│   └── api
						│       └── example
						│           ├── handler.ts
						│           └── index.ts
						├── repository
						│   ├── dynamo-client.ts
						│   └── example-repository.ts
						├── services
						│   └── example
						│       ├── example-item-create.ts
						│       ├── example-item-get.ts
						│       ├── example-item-update.ts
						│       └── index.ts
						└── types
								└── index.ts
```

## Monorepo and Build Workflow

### Workspaces

Root workspace includes both stacks and packages:

- stacks/\*
- packages/\*

### Root Scripts

From repository root:

```bash
pnpm run build
pnpm run lint
pnpm run type-check
pnpm run format
pnpm run format:fix
```

These call Turbo tasks across all workspaces.

### Turbo Behavior

- build depends on parent builds and caches dist outputs.
- format and format:fix are intentionally non-cached.
- dev tasks are persistent and non-cached.

## Package Capabilities (Detailed)

This repo has important internal package-level behavior. Most of the "magic" is here.

### 1) @custom-repo/libs

This is the core infrastructure package used by stacks.

Capabilities:

- Function definition builders for Serverless config.
- API handler wrapper with middleware and standardized error handling.
- Event metadata extraction helpers.
- Shared CustomError and Zod-aware error mapping.
- Standard response formatters.
- Utility helpers (required env vars, omit, uuid, logger).

Key files and what they do:

- functions/function-define.ts
  Creates serverless function definitions:
  - createDefaultFunction: normal Lambda function definition.
  - createDefaultApiFunc: API Gateway Lambda definition.
  - createCognitoAuthorizedApiFunction: API Gateway + Cognito authorizer.

- functions/function-gateway.ts
  createHttpHandler wraps API handlers with:
  - middy json body parsing
  - centralized try/catch
  - standardized API response formatting
  - standardized API error handling

- error/error-handling.ts
  Maps errors to Lambda/API responses:
  - CustomError -> status code + message
  - ZodError -> 400 with missing/invalid fields
  - unknown Error -> 500

- utility/env.ts
  getRequiredEnvVar enforces required environment variables at runtime.

### 2) @custom-repo/axios

HTTP client helper package.

Capabilities:

- sendRequest wrapper around axios.request.
- ParsedAxiosError class with statusCode and data.
- parseAxiosError to normalize axios errors.
- createBearerAuthHeader and createBasicAuthHeader helpers.

### 3) @custom-repo/aws-lambda

Lambda-to-Lambda invocation helper package.

Capabilities:

- invokeLambdaFn supports invocation types:
  - RequestResponse (default)
  - Event (async fire-and-forget)
  - DryRun
- Handles payload encoding/decoding.
- Parses standard Lambda responses and returns typed body.

### 4) @custom-repo/aws-ssm

AWS SSM helper package.

Capabilities:

- getParameterStoreVal for reads.
- updateParameterStoreVal for put/update.

### 5) @custom-repo/schemas

Shared schema/types package.

Capabilities:

- Generic Lambda response types.
- Core primitive/shared typing used by other packages.

### 6) @custom-repo/ts-configs

Central TypeScript base config package.

Capabilities:

- strict TypeScript defaults reused by all workspaces.
- shared compiler settings for consistency across stacks/packages.

## Stack Structure

Each stack should follow the same layered structure used in stacks/example:

```text
stack-name/
	serverless.ts
	env.ts
	src/
		functions/
			api/
			workers/ (optional)
			jobs/ (optional)
		services/
		repository/
		types/
```

### serverless.ts responsibilities

- Define service/app/provider/global config.
- Define provider.environment values required by repositories.
- Import and spread function maps from src/functions/\*\*/index.ts.
- Keep package.individually true for per-function packaging.

Current example:

- Imports APIS_EXAMPLE function map.
- Sets EXAMPLE_TABLE_NAME in provider.environment.
- Registers functions using spread.

### env.ts responsibilities

- Validate required deployment-time environment values with zod.
- Fail fast with clear error if invalid or missing.

## How API Lambda Functions Are Created

This repo uses a 3-step API function pattern.

### Step 1: Function Definition (Serverless mapping)

In `src/functions/api/<domain>/index.ts:`

```ts
import { createDefaultApiFunc } from '@custom-repo/libs';

export const APIS_EXAMPLE = {
  getExampleItemById: createDefaultApiFunc({
    directory: __dirname,
    handlerFn: 'getExampleItemById',
    http: {
      method: 'GET',
      path: '/v1/example/item/{id}',
    },
  }),
};
```

What this does:

- Builds handler path automatically from current directory and handler function name.
- Creates API Gateway event with method/path.
- Injects default CORS config unless explicitly disabled.

### Step 2: Handler implementation

In `src/functions/api/<domain>/handler.ts:`

```ts
import { createHttpHandler } from '@custom-repo/libs';

export const getExampleItemById = createHttpHandler<null>(async (event) => {
  // validate inputs
  // call service
  // return domain response
});
```

What this does:

- Parses JSON request body (middy middleware).
- Wraps business logic with standardized error handling.
- Formats API responses consistently.

### Step 3: Wire into serverless.ts

In stack root serverless.ts:

```ts
import { APIS_EXAMPLE } from './src/functions/api/example';

const serverlessConfig = {
  // ...
  functions: {
    ...APIS_EXAMPLE,
  },
};

export default serverlessConfig;
```

## How Normal (Non-API) Lambda Functions Are Created

Current example stack primarily shows API Lambdas, but the repo already supports normal Lambdas through createDefaultFunction.

### Recommended structure

```text
src/functions/workers/<domain>/
	handler.ts
	index.ts
```

### Function definition (index.ts)

```ts
import { createDefaultFunction } from '@custom-repo/libs';

export const WORKERS_EXAMPLE = {
  processExampleJob: createDefaultFunction({
    directory: __dirname,
    handlerFn: 'processExampleJob',
    other: {
      timeout: 60,
      memorySize: 1024,
    },
  }),
};
```

### Handler implementation (handler.ts)

```ts
import { formatResponse, handleDefaultError } from '@custom-repo/libs';

export const processExampleJob = async (event: unknown) => {
  try {
    // business logic
    return formatResponse({ ok: true }, 200);
  } catch (error) {
    return handleDefaultError(error);
  }
};
```

### Register in serverless.ts

```ts
import { WORKERS_EXAMPLE } from './src/functions/workers/example';

const serverlessConfig = {
  // ...
  functions: {
    ...WORKERS_EXAMPLE,
  },
};

export default serverlessConfig;
```

## Repository Layer Rules (Important)

Repository modules are where table-level access is performed. This layer has strict expectations.

### Required rule: table env var must be in serverless.ts

Repository files read table names via getRequiredEnvVar:

```ts
const TABLE_NAME = getRequiredEnvVar('EXAMPLE_TABLE_NAME');
```

Therefore, the stack must define this key in provider.environment in serverless.ts:

```ts
const serverlessConfig = {
  // ...
  provider: {
    // ...
    environment: {
      DYNAMO_TABLE_EXAMPLE_TABLE: 'example-table',
    },
  },
};
```

If not defined, runtime throws immediately.

### Repository composition in this template

- `repository/dynamo-client.ts`
  Low-level DynamoDB command wrappers (get/query/put/update/describe).

- `repository/<domain>-repository.ts`
  Domain-specific repository functions using table constants and typed schemas.

### Repository best practices for this repo

1. One repository file per domain aggregate.
2. Declare TABLE_NAME at top from getRequiredEnvVar.
3. Keep AWS SDK command details in dynamo-client wrapper calls.
4. Return typed objects validated by zod where practical.
5. Do not place business logic in repository layer.

## Service Layer Structure

Services orchestrate business logic and call repositories.

Current pattern:

- `services/example/index.ts` re-exports service operations.
- `services/example/example-item-create.ts` contains create operation.
- `services/example/example-item-get.ts` contains get/query/describe operations.
- `services/example/example-item-update.ts` contains update operation.

Service rules:

1. Keep handlers thin; put domain logic in services.
2. Services call repositories, not AWS SDK directly.
3. Services may add domain checks and transform outputs.
4. Services should return clean domain objects for handlers.

## Function Layer Structure

Functions are the entry points and should stay minimal.

Current API function structure:

```text
src/functions/api/example/
	index.ts      # serverless mapping definitions
	handler.ts    # runtime handler functions
```

Function rules:

1. index.ts defines function metadata only (path, method, handler).
2. handler.ts handles request validation and delegates to services.
3. Use createHttpHandler for API functions.
4. Throw CustomError for expected business failures.
5. Validate payloads with zod schemas from src/types.

## End-to-End Request Flow

For current API endpoints, the flow is:

1. serverless.ts loads APIS_EXAMPLE.
2. APIS_EXAMPLE entries are generated with createDefaultApiFunc.
3. API Gateway invokes mapped handler in handler.ts.
4. createHttpHandler parses body + wraps errors.
5. handler calls service function.
6. service calls repository function.
7. repository calls dynamo-client wrappers.
8. response returns through shared formatter.

## Local Development

### Install

```bash
pnpm install
```

### Build all workspaces

```bash
pnpm run build
```

### Start stack offline (example)

```bash
cd stacks/example
pnpm run offline
```

## Deployment

Example stack includes deploy script at scripts/deploy.sh.

The script enforces:

- clean git working directory
- build + lint before deploy
- table-name scan in repository folder
- interactive stage confirmation

Then deploys with Serverless Framework.

## Adding New Domain in a Stack (Recommended Checklist)

1. Add domain schema/types under `src/types`.
2. Add repository file under `src/repository` with TABLE_NAME from env.
3. Add service files under `src/services/<domain>.`
4. Add function folder under `src/functions/api/<domain>` or non-api folder.
5. Export function map from function `index.ts`.
6. Register function map in `serverless.ts`.
7. Add required table/env names to `provider.environment`.
8. Run build, lint, and type-check before deploy.

## Notes

- TypeScript path alias for stacks/example is configured as @/_ -> ./src/_.
- The current template demonstrates API Lambda pattern in production form.
- Non-API Lambda pattern is supported and should use createDefaultFunction.
