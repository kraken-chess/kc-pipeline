
# SETUP AND GETTING STARTED

Clone the package, and skim the [Getting Started section on CDK docs](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html).

# 0. Warnings

+ **DO NOT** expose either your own or the main kraken-chess AWS account/credentials accidentally in a commit
+ **DO NOT** Use the main kraken-chess AWS account for testing (you are to use your **own** account, and are responsible for any resource cleanup after you are done)

# 1. Install Dependencies

This project uses Typescript, so we will install the associated dependencies.

## Node.js >= 10.3.0

Install using [this guide based on operating sytem](https://nodejs.org/en/download/package-manager/). Node Package Manager (npm) comes installed with this as well.

Make sure you have the latest version of ```npm```, ```n```, and ```nodejs```.

```bash
$ npm cache clean -f
$ npm install -g n
$ n stable
```

## TypeScript >= 2.7:

See [TypeScript wiki](https://www.typescriptlang.org/download). However you should probably just install via npm: ```npm install typescript --save-dev```

## Install AWS CDK, and update the typescript framework

```bash
$ npm install -g aws-cdk
$ cdk --version
# run if complaints about language framework out of date
$ npx npm-check-updates -u
```

# 2. Initial AWS Setup

## [Create a personal AWS Account](https://portal.aws.amazon.com/billing/signup#/start)

Also note down the following info somewhere secure:

+ AWS account id (ex. 123456789012)
+ ```aws__access_key_id```
+ ```aws_secret_access_key```

## (Optional) [Install AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)

# 3. CDK Setup

## Setup AWS Configuration for CDK Usage

In order to use the CDK CLI in this project, you must provide:

1. AWS credentials and region (acces key, secret key, region: ex. us-west-2)
2. AWS account ID (12-digit account ID shown on AWS Console)

### AWS Credentials and Deployment Region

In any case, first create a ```.env``` file in the following path: ```/path/to/project/root/.env```.

As noted in the [Specifying Credentials CDK documentation](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html#getting_started_credentials), you have two options:

1. Create a named configuration profile
2. Specify environment variables

#### Option 1: Named Configuration Profile

Follow the above documentation to set this up for your specific operating system.
You can use the [AWS CLI credentials documentation](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html) to aid you futher. For example, your ```~/.aws/config``` (```%USERPROFILE%\.aws\config``` on Windows) could look like:

```bash
[kraken-chess]
aws_access_key_id=<your_access_key>
aws_secret_access_key=<your_secret_access_key>
region=<your_region>
````

The CDK usage using this method will be as follows for all cases:

```bash
$ cdk --profile [profile_name] [CDK_COMMANDS] ...
```

 The ```--profile``` option is useful if you already have other AWS CLI configurations, and want to leave no ambiguity as to which set of credentials you are using for this project.
 If you prefer not having to enter ```--profile``` each time, you can perform the setup using ```[default]``` profile, which the CDK CLI will default to everytime the CLI is invoked.

#### Option 2: Environment Variables

This project takes advantage of environment variables using the [npm dotenv dependency](https://www.npmjs.com/package/dotenv).
On startup, the pipeline definition will look for ```/path/to/project/root/.env``` for environment
variables, and will set them for the instance that the program is run.

```bash
AWS_ACCESS_KEY_ID=<your_access_key>
AWS_SECRET_ACCESS_KEY=<you_secret_access_key>

CDK_DEFAULT_REGION=<your_region>
```

The ```CDK_DEFAULT_REGION``` must be named as such, as it is the environment which is used by CDK in the AWS CodeBuild host to evaluate region.

This option carries more risk, however. Though the ```.env``` file is ignored by version control, it is possible for someone to easily change that, making it that much easier to accidentally commit your confidential credentials. For that reason, you should be careful if you choose this option.

### AWS Account ID

This project already uses [npm dotenv dependency](https://www.npmjs.com/package/dotenv), so you should include the following in ```/path/to/project/root/.env```:

```bash
CDK_DEFAULT_ACCOUNT=297064452163
```

The ```CDK_DEFAULT_ACCOUNT``` must be named as such, as it is the environment which is used by CDK in the AWS CodeBuild host to evaluate account ID.

Test this out by running: ```$ aws --profile kraken-chess s3 ls``` (command should not give access exceptions). At this point you can start developing, and should consult DEVELOPMENT .md

# 4. Test the Setup

## AWS Credentials recognized

```bash
$ aws --profile <your_profile> s3 mb s3://cdk-test-bucket-<your-name-in-lower-case>
$ aws --profile <your_profile> s3 rb s3://cdk-test-bucket-<your-name-in-lower-case>
# OR if you configured with environment variables...
$ aws s3 mb s3://cdk-test-bucket-<your-name-in-lower-case>
$ aws s3 rb s3://cdk-test-bucket-<your-name-in-lower-case>
```

### AWS Account ID and Region recongnized

```bash
# For Windows...
$ npm run win-clean
# For Linux/macOS...
$ npm run nix-clean
# ... and then for both
$ npm install
$ npm run build
# If using profile configs
$ cdk --profile <your_profile> synth
# OR if using environment variables...
$ cdk synth
```

After running the final command, you should see something like the following:

```
CDK Environment configurations: Account=<your_account_id>, Region=<your_region>
...
[Error at /PipelineStack] SSM parameter not available in account <account_id>, region <region>: /kraken-chess/pipeline/github/repo
Found errors
```

The error message is expected. What is important is that CDK has determined that your Account ID and Region successfully. We will now work on addressing the error message.

# 5. Setting up Dynamic Configurations

In the previous test we saw an error message regarding *"SSM Parameter not available"*. In order to use this package, we must also setup some dynamic configuration values. Quick TL;DR summarization of the actions needed to add these dynamic configurations can be shown in [1Strategy's CDK Pipline setup](https://github.com/1Strategy/cdk-serverless-pipeline-starter-template#configuring-parameters). For more context:

## AWS Systems Manager

SSM stands for the [AWS Systems Manager service](https://docs.aws.amazon.com/systems-manager/latest/userguide/what-is-systems-manager.html). It is a service which offers [Parameter Storage](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html) - essentially if you have environment specific parameters which you want to evaulate dynamically, SSM acts as a "Config" storage.

### Parameter Setup

We must create the following StringParameters with the correct values:

```bash
aws ssm put-parameter \
    --name /kraken-chess/pipeline/github/repo \
    --description "kraken-chess pipeline configuration source github repository name" \
    --type String \
    --value <github_repo_name>

aws ssm put-parameter \
    --name /kraken-chess/pipeline/github/owner \
    --description "kraken-chess pipeline configuration source github repository owner" \
    --type String \
    --value <github_rep_owner>

aws ssm put-parameter \
    --name /kraken-chess/pipeline/github/repo/branch \
    --description "kraken-chess pipeline configuration source github repository branch" \
    --type String \
    --value <github_repo_branch>
```

We can see corresponding parameter names in our source code:

```typescript
export const CDK_PIPELINE_SOURCE_REPO_NAME = "/kraken-chess/pipeline/github/repo";
export const CDK_PIPELINE_SOURCE_REPO_OWNER = "/kraken-chess/pipeline/github/owner";
export const CDK_PIPELINE_SOURCE_REPO_BRANCH = "/kraken-chess/pipeline/github/repo/branch";
```

However, this is not the only dynamic configuration we need to setup. Because SSM StringParameters are not suitable for things like passwords, API keys, etc..., we must use another service.

## AWS Secrets Manager

[AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html) allows you to replace hardcoded credentials in your code, including passwords, with an API call to Secrets Manager to retrieve the secret programmatically.
This removes security risks. You can also setup encryption schemes and key rotation.

This is used here to store the [repository personal access token](https://docs.aws.amazon.com/codepipeline/latest/userguide/GitHub-create-personal-token-CLI.html) for AWS CodePipeline to use.
TL;DR, your pipeline needs to create a webhook to your source repositories so that commits will trigger a build in the pipeline. This requires your personal access token, which should not be given to anyone. As such, we use AWS Secrets Manager to store this.

**NOTE:** users with sufficient priviledge can read your personal access token using the AWS Console or AWS CLI. In order to restrict visibility to only admin or root users, ensure that the correct parties are given read-only access to the AWS Console/CLI.

### Secret Setup

Go through the [wiki linked above](https://docs.aws.amazon.com/codepipeline/latest/userguide/GitHub-create-personal-token-CLI.html) to setup your token. The token must be created using a personal github account - cannot do for an organization as a whole. As such, it is recommended to create a separate github account exclusively for administrative tasks such as this when working within an organization.

Create a Secret:

```bash
aws secretsmanager create-secret \
    --name /kraken-chess/pipeline/secrets/github/token \
    --secret-string '{"github-token":"<your_token>"}'
```

Note the corresponding secret name in our source code:

```typescript
export const CDK_PIPELINE_SOURCE_REPO_AUTH = {
  key: "/kraken-chess/pipeline/secrets/github/token",
  jsonField: "github-token",
} as const;
```

## Testing Dynamic Configuration

```bash
# For Windows...
$ npm run win-clean
# For Linux/macOS...
$ npm run nix-clean
# ... and then for both
$ npm install
$ npm run build
# If using profile configs
$ cdk --profile <your_profile> synth
# OR if using environment variables...
$ cdk synth
```

You should see no errors this time.

# 6. Start [`Contributing`](CONTRIBUTING.md)

**NOTE:** Please note any issues you find with the setup for any platform in the repository *Issues*
