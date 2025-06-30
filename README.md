# Chat App 👩‍💻

This is a simple chat app built with React and Firebase

## Installation 🔧

- Install all dependencies: `npm i`

## Running the App 🚀
- access the deployed version at [https://keidyz.github.io/yazen-kei/](https://keidyz.github.io/yazen-kei/)

or 

- Create a `.env` file in the root directory and add your Firebase configuration:
  ```
  VITE_FIREBASE_API_KEY=your_api_key
  VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
  VITE_FIREBASE_PROJECT_ID=your_project_id
  VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
  VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
  VITE_FIREBASE_APP_ID=your_app_id
  ```
- Start the app: `npm start`

## Extras 🐛
- When the user is not near the bottom of the chat and a new message arrives,
the scroll position sometimes jitters a bit.
    - Was going crazy but it's caused by the parent scroll's scroll height being used for the scrollbar calculation
        despite it not being the final scroll height yet
- I've used firestore before and don't remember the dev experience being this horrifying 😬
    - or maybe I'm just using it wrong 🫠
