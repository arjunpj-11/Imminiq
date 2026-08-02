# Imminiq AWS production deployment

This stack creates a private S3 bucket and unified CloudFront PWA/API endpoint, an ECR
repository, a small EC2 Docker host, Systems Manager access, and a GitHub OIDC deployment
role. The API security group accepts traffic only from AWS's managed CloudFront origin
network list, avoiding a separately billed load balancer. Free Tier and credit eligibility
depends on the AWS account, its age, region, traffic, storage, and selected instance type.

The backend host runs the API, Redis, and Piston containers. Application secrets remain
in Doppler; AWS Systems Manager stores only the restricted Doppler service token used to
bootstrap the host after a restart.

While CloudFront account verification is pending, deploy with `DeliveryMode=temporary`.
In this mode the same EC2 host runs Caddy on ports 80/443, obtains a temporary public
certificate for `<public-ip>.sslip.io`, serves the PWA copied from the private S3 bucket,
and proxies API and Socket.IO traffic to the local API container. Switch back to
`DeliveryMode=cloudfront` after AWS Support enables CloudFront.

Set `TemporaryDomainName=imminiq.arjunpj.online` to use the production hostname during
temporary mode. Its DNS must point to the EC2 public address before Caddy can issue the
HTTPS certificate.

## Bootstrap

1. Sign in to AWS and Doppler locally.
2. Create a Doppler project named `imminiq` with a `prd` config and import the production
   API values.
3. Deploy `production.yaml` in `ap-south-1`, supplying the default VPC, public subnets,
   and that region's `com.amazonaws.global.cloudfront.origin-facing` prefix-list ID.
4. Store a read-only Doppler service token once in the encrypted Systems Manager
   parameter `/imminiq/production/doppler-token`. The workflow assumes the stack's
   non-secret `GitHubDeploymentRoleArn` through GitHub OIDC; GitHub does not receive a
   Doppler token. The EC2 host reads the restricted token from Systems Manager during
   deployment.
5. Run the **Deploy to AWS** workflow once to verify its protected environment. After
   that, every successful **CI Checks** run on `main` deploys the backend image to ECR,
   publishes the PWA to S3, restarts the EC2 Docker services, and verifies production
   health automatically. Changes pushed only to `sub-main` are tested but not deployed.

CloudFront-generated URLs are usable immediately. Add Route 53 aliases and ACM
certificates later if a custom domain is required.
