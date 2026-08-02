# Imminiq production operations guide

This guide is specific to the current Imminiq production environment.

| Item                 | Value                                             |
| -------------------- | ------------------------------------------------- |
| Region               | `ap-south-1` (Mumbai)                             |
| Website              | `https://imminiq.arjunpj.online`                  |
| API readiness        | `https://imminiq.arjunpj.online/api/health/ready` |
| Application stack    | `imminiq-production`                              |
| Monitoring stack     | `imminiq-production-monitoring`                   |
| EC2 instance         | `i-04eec9c0a57e4b1c0`                             |
| Container log group  | `/imminiq/production/containers`                  |
| CloudWatch dashboard | `imminiq-production`                              |

## What is monitored now

The monitoring stack in `infra/aws/monitoring.yaml` installs and configures the
CloudWatch agent without replacing or rebooting the production EC2 instance. It provides:

- a 30-day centralized Docker log group;
- EC2 CPU and status-check alarms;
- a memory metric and high-memory alarm;
- an application-error metric and alarm for error, exception, fatal, and failed log terms;
- a CloudWatch dashboard with CPU, status, memory, and recent errors.

The alarms currently detect problems and appear in CloudWatch. To receive email, Slack,
or pager notifications, connect an SNS topic as described below.

## Five-minute incident checklist

Use this order. It separates a browser-only failure from an API or server failure quickly.

1. Open the website in a private browser window and hard-refresh it.
2. Open the readiness URL. A healthy response is HTTP 200 with Mongo and Redis both true.
3. In AWS Console, select **Mumbai (`ap-south-1`)**, then open **CloudWatch > Dashboards >
   imminiq-production**.
4. Look at **Alarms > All alarms** for names beginning `imminiq-production-`.
5. Open **CloudWatch > Logs > Logs Insights**, select
   `/imminiq/production/containers`, choose a narrow time window, and run the queries below.
6. Open **GitHub > Actions**. Check **CI Checks** first, then **Deploy to AWS**. A deployment
   must not run unless CI succeeded.
7. If the API is unhealthy, use **Systems Manager > Fleet Manager** or **Run Command** to
   inspect the containers. SSH is not required.

Record the incident start time, affected URL, user role, browser, request ID if shown,
deployment commit, and the exact error. Never paste passwords, tokens, cookies, or reset
codes into tickets or Run Command.

## Useful Logs Insights queries

Recent errors:

```text
fields @timestamp, @message
| filter @message like /(?i)(error|exception|fatal|failed)/
| sort @timestamp desc
| limit 100
```

Browser-reported client errors:

```text
fields @timestamp, @message
| filter @message like /client_error/
| sort @timestamp desc
| limit 100
```

HTTP 5xx responses:

```text
fields @timestamp, @message
| filter @message like /\"statusCode\":5[0-9][0-9]/
| sort @timestamp desc
| limit 100
```

Authentication and authorization problems:

```text
fields @timestamp, @message
| filter @message like /(?i)(unauthorized|forbidden|csrf|invalid.*token|step.up|2fa)/
| sort @timestamp desc
| limit 100
```

The outer message is Docker's JSON record and the application log inside it is also JSON.
Start by reading `@message`; add `parse` statements later only after checking the exact live
shape. Keep the time range narrow because Logs Insights charges for data scanned.

## Command-line checks

These commands are read-only unless a section explicitly says otherwise.

```bash
curl -fsS https://imminiq.arjunpj.online/api/health/ready

aws cloudwatch describe-alarms \
  --region ap-south-1 \
  --alarm-name-prefix imminiq-production-

aws logs tail /imminiq/production/containers \
  --region ap-south-1 \
  --since 30m

aws cloudformation describe-stacks \
  --region ap-south-1 \
  --stack-name imminiq-production

aws cloudformation describe-stacks \
  --region ap-south-1 \
  --stack-name imminiq-production-monitoring

aws ssm describe-instance-information \
  --region ap-south-1 \
  --filters Key=InstanceIds,Values=i-04eec9c0a57e4b1c0
```

For a container inspection, use Systems Manager Run Command with `AWS-RunShellScript` and
target only `i-04eec9c0a57e4b1c0`:

```bash
cd /opt/imminiq
docker compose -f docker-compose.production.yml ps
docker compose -f docker-compose.production.yml logs --since=30m --tail=300 api
```

Do not place a secret directly in Run Command. AWS retains command history, and API activity
is auditable through CloudTrail.

## Automatic deployment from `main`

The intended production sequence is:

```text
push/merge to main
  -> CI Checks: format, lint, API tests, web tests, builds, local browser routes
  -> Deploy to AWS assumes a short-lived GitHub OIDC role
  -> API image is built and pushed to ECR
  -> frontend is uploaded to S3
  -> SSM updates the EC2 host and restarts services
  -> readiness checks and production browser routes run
```

`sub-main` runs checks but does not deploy. The deploy workflow listens for a successful
`CI Checks` run on `main`, so a failed check blocks production. The production browser check
is important: a plain HTTP check can return 200 even when JavaScript crashes before rendering.

The files controlling this are:

- `.github/workflows/ci.yml`
- `.github/workflows/deploy-aws.yml`
- `apps/web/playwright.config.ts`
- `apps/web/tests/e2e/production-smoke.spec.ts`

Protect the GitHub `production` environment and restrict it to `main`. Keep the AWS trust
policy limited to this repository and environment. GitHub should receive temporary OIDC
credentials, not long-lived AWS access keys.

## Completing or repairing a frontend publish

The normal GitHub workflow should do this. If S3 contains the new bundle but the temporary
EC2/Caddy host still serves the previous bundle, run this once through Systems Manager Run
Command, targeting only the production instance:

```bash
aws s3 sync \
  s3://imminiq-production-frontendbucket-whjxjrspoj50 \
  /opt/imminiq/web \
  --delete \
  --exclude 'runtime/*'
```

Then hard-refresh the site and re-run the production browser tests. This sync changes only
the static frontend; it does not restart the API.

## Rollback

Do not rollback until you know whether the frontend, API image, configuration, or data caused
the problem.

Frontend rollback:

1. In S3, enable **Show versions** in the production frontend bucket.
2. Identify the last good `index.html` version and its matching hashed assets.
3. Copy the previous version onto the same key so it becomes current, rather than deleting
   historical versions.
4. Sync S3 to `/opt/imminiq/web` and verify in a private browser window.

API rollback:

1. In ECR, identify the previous image digest and its commit tag.
2. Redeploy that immutable digest or re-run the known-good deployment.
3. Verify readiness, login/refresh, password reset, and admin authorization checks.

Never run broad delete commands against the bucket, `/opt/imminiq`, or Docker volumes. Back up
stateful data before any infrastructure replacement.

## IAM findings and required practice

The account currently has MFA on the root user and no root access keys, which is good. It has
no IAM users and four roles. The two relevant application roles are:

- `imminiq-production-github-deploy`: assumed by GitHub through OIDC for deployments;
- `imminiq-production-ec2`: attached to the server for S3, SSM, secrets bootstrap, ECR, and
  CloudWatch-agent access.

The local AWS CLI session used for this audit was the account root identity. Stop using root
for daily work. Create an IAM Identity Center administrative identity or an assumable admin
role with MFA and temporary credentials. Reserve root for root-only account tasks. Do not
solve this by creating many IAM users or long-lived access keys.

Review every role quarterly:

1. IAM > Roles > role name > **Last accessed**.
2. Remove unused actions and resources after validating in a non-production environment.
3. Check the trust policy separately from the permissions policy.
4. Keep GitHub OIDC `sub` conditions scoped to the repository and protected production
   environment.
5. Enable CloudTrail alerts for root activity and unexpected role assumption.

## Enabling notifications

Create one SNS topic in `ap-south-1`, subscribe the operations email, and confirm the email
subscription. Then update only the monitoring stack with the topic ARN:

```bash
aws cloudformation deploy \
  --region ap-south-1 \
  --stack-name imminiq-production-monitoring \
  --template-file infra/aws/monitoring.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    ProjectName=imminiq \
    EnvironmentName=production \
    ApiInstanceId=i-04eec9c0a57e4b1c0 \
    InstanceRoleName=imminiq-production-ec2 \
    AlarmNotificationTopicArn=arn:aws:sns:ap-south-1:ACCOUNT_ID:TOPIC_NAME
```

Use at least two recipients for production. Trigger a controlled test alarm, confirm delivery,
then return it to OK. An alarm without a confirmed subscription does not notify anyone.

## How to edit CloudFormation YAML safely

YAML uses spaces for structure; never use tabs. A mapping is `key: value`, a list item starts
with `-`, and indentation determines parent/child relationships.

Common CloudFormation functions in these templates:

- `!Ref Name`: parameter value or resource identifier;
- `!Sub 'text-${Name}'`: string interpolation;
- `!GetAtt Resource.Attribute`: a resource attribute such as an ARN;
- `!If [Condition, true-value, false-value]`: conditional value;
- `DependsOn`: explicit creation order when references do not already imply it;
- `DeletionPolicy: Retain`: preserve important data if the stack resource is removed.

Use this change process:

1. Edit the smallest possible template section.
2. Validate syntax:

   ```bash
   aws cloudformation validate-template \
     --region ap-south-1 \
     --template-body file://infra/aws/monitoring.yaml
   ```

3. Run repository format, lint, tests, and builds.
4. Create a CloudFormation change set, but do not execute it yet.
5. Inspect every resource's **Action** and **Replacement** field.
6. Stop if an EC2 instance, database, bucket, log group, or IAM trust relationship would be
   replaced or deleted unexpectedly.
7. Apply in a maintenance window, monitor stack events, then run production smoke tests.

Important current warning: a preview made from the checked-in `infra/aws/production.yaml`
against the live application stack indicated a conditional replacement of the EC2 instance,
caused by current image/user-data differences and the template's dynamic latest-AMI reference.
That change set was not executed. Do not directly deploy `production.yaml` to the live stack
until the AMI is pinned and an explicit blue/green or replacement plan exists. The separate
`monitoring.yaml` stack avoids that replacement risk.

## Weekly and monthly routine

Weekly:

- check all alarms are OK and have actions;
- review failed CI/deploy runs;
- sample authentication, password reset, a normal user path, and an admin path;
- review recent application errors and unexpected 4xx/5xx increases;
- confirm backups and one known-good ECR image are available.

Monthly:

- test an alarm notification and a rollback in non-production;
- review IAM role access and GitHub environment protection;
- review CloudWatch/S3/ECR cost and retention;
- patch the host and base images through a planned deployment;
- check certificate and domain renewal/health;
- review dependency and container vulnerability reports.

No test suite can guarantee that no future error will ever occur. The reliable production
standard is to prevent known regressions before deploy, detect failures quickly after deploy,
alert a human, and maintain a tested rollback path.

## Official AWS references

- CloudWatch Logs Insights: https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html
- CloudFormation change sets: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-changesets.html
- GitHub/OIDC federation: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_oidc.html
- Root-user best practices: https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html
- Systems Manager Run Command: https://docs.aws.amazon.com/systems-manager/latest/userguide/running-commands.html
- Restoring S3 object versions: https://docs.aws.amazon.com/AmazonS3/latest/userguide/RestoringPreviousVersions.html
