# LINGOsonicNextusV8NitroCanon — isolated sidecar

An independent web and serverless foundation for tooling, job intake, evidence handling, and operational visibility. This lives only under this sidecar directory and does not change the flagship app, production DNS, Cloudflare routes, Firebase, or G02 gate.

## Stack
- React, JavaScript, HTML, CSS, Vite
- Python 3.12 AWS Lambda
- API Gateway HTTP API with AWS IAM authorization
- SQS + dead-letter queue; DynamoDB on-demand job status
- Private encrypted S3 artifact bucket
- CloudWatch logs and alarm
- Docker/Linux development; GitHub Actions build validation

## Not provisioned in the baseline
RDS, Amazon MSK/Kafka, ECS, and Amplify are documented future integrations, not created resources. They can introduce recurring charges and additional identity, network, security, and operational requirements. Add them only in a reviewed change with budgets and teardown steps.

## Local development
Requirements: Node.js 20+ and npm.

    npm install
    npm run dev

Build:

    npm run build

Docker:

    docker build -t lingosonic-nextus-sidecar .
    docker run --rm -p 4173:4173 lingosonic-nextus-sidecar

## Infrastructure template
infra/template.yaml is infrastructure-as-code only; it has not been deployed and does not prove AWS authentication, account ownership, DNS, or live service availability.

Validate identity and template before any deployment:

    aws sts get-caller-identity
    aws cloudformation validate-template --template-body file://infra/template.yaml

Deployment, if separately approved after cost/security review:

    aws cloudformation deploy --template-file infra/template.yaml --stack-name lingosonic-nextus-sidecar-dev --capabilities CAPABILITY_IAM

The job route uses AWS IAM authorization. Do not replace it with a public unauthenticated route. The web page contains no AWS credentials and does not invoke the protected API directly.

## Security and operations
- Never commit AWS keys, GitHub tokens, Claude/Cursor credentials, private keys, or .env files.
- Use short-lived SSO/role credentials and least-privilege IAM.
- Keep the artifact bucket private, encrypted, and blocked from public access.
- Configure MFA, budgets, log retention, and stack teardown before a live deployment.
- API Gateway IAM auth is not end-user sign-in; browser integration requires a trusted backend or properly designed identity flow.
- Keep production configuration separate from development.
- Run dependency audits and image scans before release.

## Status
- Source scaffold: created on an isolated branch.
- AWS resources: not deployed.
- API tokens: none generated or stored.
- Domain/Amplify: not connected.
- CI: pending.
- Flagship production and G02: unchanged.
