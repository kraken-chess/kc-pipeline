# KRAKEN CHESS CD/CI PIPELINE

## Overview

Manages the Continuous Deployment/Continuous Integration (CD/CI) pipeline responsible for
deploying the [kraken-chess project](https://github.com/kraken-chess).

Pipeline is provided by [AWS CodePipeline](https://docs.aws.amazon.com/codepipeline/latest/userguide/welcome.html).
Infrastructure-as-code done using the Typescript library and CLI [AWS Cloud Development Kit (CDK)](https://docs.aws.amazon.com/cdk/latest/guide/home.html), which saves many lines of raw boilerplate CloudFormation YAML or JSON.

+ You can think of CloudFormation templates as Assembly language, and CDK constructs as your favorite high level programming language

Pipeline is responsible for building, testing, and deploying any commits made to the *master* branches
of the following source repositories:

+ [Pipeline source configuration](https://github.com/kraken-chess/kc-pipeline)
+ [Website source code](https://github.com/kraken-chess/kc-web-ui)
+ [Core backend source code](https://github.com/kraken-chess/kc-gateway)

## How do I use this package

Use it if you want to make a change in the Kraken Chess CD/CI pipeline configurations:

+ Change build scripts
+ Add new source repositories
+ Add a whole new stage (ex. prod stage)

That being said, you need to understand some fundamentals to help you troubleshoot.

### "Yes I know how CloudFormation and CDK work"

Go to the [`Setup ad Getting Started`](SETUP.md) section.

### "I know how CloudFormation works (or a similar Infrastructure-as-Configuration product), but not CDK"

You've done the hard part. Now just go over:

+ [CDK Basic Concepts](https://docs.aws.amazon.com/cdk/latest/guide/core_concepts.html)
+ [Getting started with CDK](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html)
+ [Quick example to test your understanding](https://docs.aws.amazon.com/cdk/latest/guide/serverless_example.html)

From there you can proceed to [`Setup and Getting Started`](SETUP.md).

### "I don't know how either CloudFormation or CDK work, but have used AWS"

I'd recommend the basics of CloudFormation, followed by everything in the above case:

+ [CloudFormation Basic Concepts](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-whatis-concepts.html) and [Basic Workflow](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-whatis-howdoesitwork.html)
+ The ENTIRE [Getting Started with CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/GettingStarted.html) section
+ Run through some [examples using the AWS CLI](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-using-cli.html)

  + I advise against using the [CloudFormation Designer](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/working-with-templates-cfn-designer.html) purely for the reason that knowing the underlying YAML/JSON promotes more understanding than a drag-and-drop UI

### "I don't have time to read - just tell me how to make changes"

![O RLY](assets/spongebob_lifeguard.jpg)

...jump straight into [`Setup and Getting Started`](SETUP.md).

## [`Setup and Getting Started`](SETUP.md)

Once you've finished verifying your local setup, move onto Development and Contribution.

## [`Development and Contribution`](CONTRIBUTION.md)

## General References

+ [AWS CodePipeline documentation](https://docs.aws.amazon.com/codepipeline/latest/userguide/welcome.html)
+ [CDK documentation](https://docs.aws.amazon.com/cdk/latest/guide/home.html)
+ [CDK Typescript reference](https://docs.aws.amazon.com/cdk/api/latest/typescript/api/index.html)
+ Examples that drove implementation:
  + [AWS CodePipeline CDK Example documentation](https://docs.aws.amazon.com/cdk/latest/guide/codepipeline_example.html)
  + [1Strategy's open source pipeline implementation in python](https://github.com/1Strategy/cdk-serverless-pipeline-starter-template)
