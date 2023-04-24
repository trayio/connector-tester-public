# docs-capi-form-builder-demo

## Introduction

This app can be used for complete end to end testing of Tray's connectivity API offering. Skip to [instructions](#instructions)

Here are the features of the app:

- **Onboard new end users**
  ![end-user-onboarding](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/8a726619-c890-4b95-a9a0-41be186c0b6a/Untitled.png)
- **Generate a UI form for any connector/ any operation.**
  You can generate a complete form that includes all fields or only the required form, which will only show the required input fields for the operation.
  ![ui-form](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/04387970-992c-4891-8e1b-7c62db4cbbae/Untitled.png)
- **Create new Auths for a connector using auth dialogue popup.**
  ![create-new-auth](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/48c5bbd4-c1ba-47b7-8e88-7ae2cfb52b2c/Untitled.png)
- **Call the connector by hitting the form submit button.**
  ![hit-form-submit](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/a1928196-e7e7-45b4-a123-45410ba178a6/Untitled.png)
- **Visualise the input payload for the Call connector which is generated live while the form is being filled.**
  ![edit-payload](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/76bea513-af65-4e52-b917-aa1579a33d37/Untitled.png)
- Edit the payload before hitting the submit button to test for unhappy paths. (ex. Edit the spreadsheet_id before calling ‘**get_rows**’ operation for the Sheets connector to see what the response is for non-existent spreadsheet)

## Instructions

Pre requisites before using this app:

**Setting up the server**

1. Clone this repo.
2. Open terminal in the root folder of the repo.
3. Switch to backend folder using `cd backend`
4. Add your master token in the .env file `MASTER_TOKEN='<YOUR_MASTER_TOKEN>'`
5. Run `npm install`
6. Run `npm start`

You server would be running on `http://localhost:5001` now.

Now that the server is up and running successfully:

1. Open a new terminal window and switch to frontend folder.
2. Open config.js file in src folder in frontend directory.
3. Edit the API_URL to `http://localhost:5001`. Change the PARTNER_NAME to your [embeddedId](https://tray.io/documentation/embedded/getting-started/embedded-id-and-master-token/)
4. Run `npm install`
5. Run `npm run dev`

The above step should deploy the app on `http://localhost:5173`

All done!
