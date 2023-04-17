# docs-capi-form-builder-demo

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

Here is a loom video: