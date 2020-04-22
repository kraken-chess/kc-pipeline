// Store this in AWS Secrets Manager with your repository oauth token
export const CDK_PIPELINE_SOURCE_REPO_AUTH = {
  key: "/kraken-chess/pipeline/secrets/github/token",
  jsonField: "github-token",
} as const;

// Store these in AWS Systems Manager
export const CDK_PIPELINE_SOURCE_REPO_NAME = "/kraken-chess/pipeline/github/repo";
export const CDK_PIPELINE_SOURCE_REPO_OWNER = "/kraken-chess/pipeline/github/owner";
export const CDK_PIPELINE_SOURCE_REPO_BRANCH = "/kraken-chess/pipeline/github/repo/branch";

export let createListOfStringParameterArns = function (
  accountRegion: string,
  accountId: string
): Array<string> {
  const arnPrefix = `arn:aws:ssm:${accountRegion}:${accountId}:parameter`;
  return [
    `${arnPrefix}${CDK_PIPELINE_SOURCE_REPO_NAME}`,
    `${arnPrefix}${CDK_PIPELINE_SOURCE_REPO_OWNER}`,
    `${arnPrefix}${CDK_PIPELINE_SOURCE_REPO_BRANCH}`,
  ];
};
