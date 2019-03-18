npm -- a JavaScript package manager
=============================

[![Build Status](https://img.shields.io/travis/npm/cli/latest.svg)](https://travis-ci.org/npm/cli)

## SYNOPSIS
*  This code works only with Android.
*  This code is all about how to integrate iot devices and control them using smartthings app.
*  When using my source code, make sure to run npm install in the extracted folder!

## Requirements
1. NPM(node package manager) install.
2. auth0 account(for authentication).
3. AWS dynamoDB.
4. AWS IOT.
5. AWS lambda.
6. Samsung account.
7. Smartphone with smartthings app installed.
8. Program language is node.Js

## Super Easy Install

npm is bundled with [node](https://nodejs.org/en/download/).

### windows Computers

[Get the MSI](https://nodejs.org/en/download/).  npm is in it.

## Description

### Auth0

1. Create Samsung and auth0 accounts.
2. Go to <https://smartthings.developer.samsung.com/docs/guides/smartthings-schema/basics.html> and copy OAuth2 callback URL.
3. Log in to auth0 account and create an application.
4. Go to that application->settings.
5. Paste the callback URL copied from smartthings website in Allowed callback URLs.
6. Now,Copy client ID and client Secret in the same page in auth0.
7. Go to advanced options (avaliable at that bottom of the settings tab only).
8. In that go to Endpoints.
9. Copy OAuth Authorization URL and OAuth Token URL.

### Host your AWS Lambda function

1. Create a new lambda function from <https://aws.amazon.com/>.
2. Enter details for your new Lambda function.
*  Name: "demoSTSchema"
*  Runtime: “Node.js” (we used version 8.10)
*  Role: Create a new role
*  Role Name: “demoSTSchema”
*  Click Create function
3. Locate the “ARN” after creating your Lambda function.

Example ARN:
arn:aws:lambda:us-east-1:123456789000:function:demoSTSchema

4. Now Clone this file and upload to AWS Lambda function. i.e, "demoSTSchema"

#### Provide SmartThings permissions to your Lambda function

1. Using AWS CLI give SmartThings permissions to access your Lambda function.
2. Run the following command.
    aws lambda add-permission --profile default --function-name demoSTSchema --statement-id smartthings --principal 148790070172 --action lambda:InvokeFunction
 
*  Note demoSTSchema - is your lambda function name.

### Smartthings
1. Go to smartthings developer workspace and log in with your Samsung account creadentials.  <https://devworkspace.developer.samsung.com/smartthingsconsole/iotweb/site/#/>
2. Then click on device Integration -> Cloud connected device connected to your cloud -> with SmartThings Schema beta.
3. Enter all the required details.
*  In Display name - enter a name.
*  Hosting type - AWS Lambda.
*  Target ARN - Paste the ARN of your AWS lambda function.
*  Client ID - Paste the Client ID copied from Auth0.
*  Client Secret - Paste the Client Secret copied from Auth0.
*  Authorization URL - Paste the Authorization URL copied from Auth0.
*  Refresh token URL - Paste the OAuth Token URL copied from Auth0.
*  Partner OAuth scope - This field is Optional.
*  Brand name - Enter a name whichever you want.
*  Brand logo image - upload an image with 240*240 pixels in dimensions.
4. click on Save.
5. click on self-publish.

#### Now your device is published.

## Working

1. Open smartthings app in your smartphone.
2. Go to settings.
3. Long press About Smartthings for 5 seconds.
4. Enable the Developer Mode.
5. Restart the Smartthings app.
6. Now, developer mode is enabled.
7. Go to Devices-> Add a new device.
8. Scroll down and you'll see My testing devices.
9. click on that and it displays your display name given while creating device integration.
10. click on that and You'll be redirected to auth0.
11. Log in - if you have an auth0 account (or) sign up.
12. After successful connection, It discovers all your devices that are in your AWS dynamoDB connected to your auth0 account.
13. Now go to home.
14. Control your devices.

## Refrence Link
1. Create a new cloud-connected device with SmartThings Schema  - <https://smartthings.developer.samsung.com/docs/getting-started/st-schema.html>
2. SmartThings Schema reference - <https://smartthings.developer.samsung.com/docs/guides/smartthings-schema/smartthings-schema-reference.html>
3. Device handler type - <https://smartthings.developer.samsung.com/docs/guides/smartthings-schema/device-handler-types.html>
*  device handler types are nothing but capabilities.capabilities are used for using correct handle type like if we want to control only "ON,OFF & brightness" then we need to choose "c2c-dimmer" not "c2c-rgbw-color-bulb".
