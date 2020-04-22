import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import { StringParameter } from "@aws-cdk/aws-ssm";
import {
  PipelineProject,
  LinuxBuildImage,
  ComputeType,
  BuildSpec,
} from "@aws-cdk/aws-codebuild";
import { Artifact, Pipeline } from "@aws-cdk/aws-codepipeline";
import {
  GitHubSourceAction,
  CodeBuildAction,
  CloudFormationCreateUpdateStackAction,
} from "@aws-cdk/aws-codepipeline-actions";
import * as PipelineStrings from "./pipeline-strings";

const PIPELINE_NAME : string = "KrakenChessPipeline";
const PIPELINE_STACK_NAME : string = `${PIPELINE_NAME}Stack`;

export class PipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cdkBuildPipelineProject: PipelineProject = new PipelineProject(
      this,
      "PipelineCdkBuild",
      {
        buildSpec: BuildSpec.fromObject({
          version: "0.2",
          phases: {
            install: {
              commands: "npm install",
            },
            build: {
              commands: [
                "npm run build",
                `npm run cdk synth ${PIPELINE_STACK_NAME} -- -o cdk.out`,
              ],
            },
          },
          artifacts: {
            "base-directory": "cdk.out",
            files: [`${PIPELINE_STACK_NAME}.template.json`],
          },
        }),
        environment: {
          buildImage: LinuxBuildImage.STANDARD_4_0,
          computeType: ComputeType.SMALL,
        },
      }
    );

    // give AWS::CodeBuild::Project permissions to call SystemsManager.GetParameter
    cdkBuildPipelineProject.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["ssm:GetParameter"],
        resources: PipelineStrings.createListOfStringParameterArns(
          cdk.Stack.of(this).region,
          cdk.Stack.of(this).account
        ),
      })
    );

    const pipelineRepositoryOAuthSecret = cdk.SecretValue.secretsManager(
      PipelineStrings.CDK_PIPELINE_SOURCE_REPO_AUTH.key,
      {
        jsonField: PipelineStrings.CDK_PIPELINE_SOURCE_REPO_AUTH.jsonField,
      }
    );
    console.log(
      "Obtained pipeline source repository OAuth token - to be evaluated at build/synthesize time"
    );

    const pipelineRepositoryName = StringParameter.valueFromLookup(
      this,
      PipelineStrings.CDK_PIPELINE_SOURCE_REPO_NAME
    );

    const pipelineRepositoryOwner = StringParameter.valueFromLookup(
      this,
      PipelineStrings.CDK_PIPELINE_SOURCE_REPO_OWNER
    );

    const pipelineRepositoryBranch = StringParameter.valueFromLookup(
      this,
      PipelineStrings.CDK_PIPELINE_SOURCE_REPO_BRANCH
    );
    console.log(
      "Obtained pipeline source repository info: %s/%s/%s",
      pipelineRepositoryOwner,
      pipelineRepositoryName,
      pipelineRepositoryBranch
    );

    const sourceOutput: Artifact = new Artifact();
    const cdkBuildOutput: Artifact = new Artifact("CdkBuildOutput");

    new Pipeline(this, PIPELINE_NAME, {
      stages: [
        {
          stageName: "source",
          actions: [
            new GitHubSourceAction({
              actionName: "GithubPipelineSource",
              oauthToken: pipelineRepositoryOAuthSecret,
              repo: pipelineRepositoryName,
              owner: pipelineRepositoryOwner,
              branch: pipelineRepositoryBranch,
              output: sourceOutput,
            }),
          ],
        },
        {
          stageName: "build",
          actions: [
            new CodeBuildAction({
              actionName: "PipelineBuild",
              project: cdkBuildPipelineProject,
              input: sourceOutput,
              outputs: [cdkBuildOutput],
            }),
          ],
        },
        {
          stageName: "synthesize-pipeline",
          actions: [
            new CloudFormationCreateUpdateStackAction({
              actionName: "CFNPipelineStack",
              templatePath: cdkBuildOutput.atPath(
                `${PIPELINE_STACK_NAME}.template.json`
              ),
              stackName: PIPELINE_STACK_NAME,
              adminPermissions: true,
            }),
          ],
        },
      ],
    });
  }
}
