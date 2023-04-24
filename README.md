# docs-capi-form-builder-demo

## Introduction

This app can be used for complete end to end testing of Tray's connectivity API offering. Skip to [instructions](#instructions)

Here are the features of the app:

- **Onboard new end users**
- **Generate a UI form for any connector/ any operation.**
  You can generate a complete form that includes all fields or only the required form, which will only show the required input fields for the operation.
- **Create new Auths for a connector using auth dialogue popup.**
- **Call the connector by hitting the form submit button.**
- **Visualise the input payload for the Call connector which is generated live while the form is being filled.**
- **Editable codeblock to modify the payload** before hitting the submit button to test for unhappy paths. (ex. Edit the spreadsheet_id before calling ‘**get_rows**’ operation for the Sheets connector to see what the response is for non-existent spreadsheet)

## Instructions

Pre requisites before using this app:

**Setting up the server**

1. Clone this repo.
2. Open terminal in the root folder of the repo.
3. Switch to backend folder using `cd backend`
4. Create a .env file in the backend folder and add your master token as `MASTER_TOKEN='<YOUR_MASTER_TOKEN>'`
5. Run `npm install`
6. Run `npm start`

You server would be running on `http://localhost:5001` now.

Now that the server is up and running successfully:

1. Open a new terminal window and switch to frontend folder.
2. Open `config.js` file in src folder in frontend directory.
3. Edit the API_URL to `http://localhost:5001`. Change the PARTNER_NAME to your [embeddedId](https://tray.io/documentation/embedded/getting-started/embedded-id-and-master-token/).
4. (Optional step) Inside `config.js`, AUTH_DIALOG_URL by default is `embedded.tray.io`. Change it your white-labelld URL if you want to test whitelabelling.
5. Run `npm install`
6. Run `npm run dev`

The above step should deploy the app on `http://localhost:5173`

All done!
