# pog_horse_selector

This web app helps organizer record member's selected horses in POG draft meeting.

## Requirements

- Node.js (tested in v17.9.1)
- Firebase CLI (tested in 13.5.2)

## Get started

#### Project setup
```
$ yarn install
```

#### Prepare horse data

For 2024, you should just copy sample file.
```
$ cp src/assets/horse_catalogue_2024.sample.json src/assets/horse_catalogue.json
```

JSON format
```
[
  {
    "id": Netkeiba_HORSE_ID,
    "name": "HORSE_NAME",
    "sire": "HORSE's_SIRE_NAME",
    "mare": "HORSE's_MARE_NAME"
  },
  ...
]
```

#### Setup Firebase project

1. Go  [Firebase console](https://console.firebase.google.com/) and create a project
1. Add new app
    1. Select Web app
    1. Check Firebase Hosting
    1. Add Firebase SDK
1. Get your app configuration
    - apiKey
    - authDomain
    - projectId
    - storageBucket
    - messageSenderId
    - appId
1. Create Realtime database
    1. Get database url `https://xxx.firebaseio.com`
    1. Set rule
        ```
        {
          "rules": {
            ".read": false,
            ".write": false,
            "horse": {
              ".read": "auth != null",
              ".write": "auth != null",
            },
            "group": {
              ".read": "auth != null",
              ".write": "auth != null",
            } 
          }
        }
        ```
1. Copy `.env.sample` to `.ėnv.local` and set your own configuration

#### Compiles and hot-reloads for development
```
$ export NODE_OPTIONS=--openssl-legacy-provider  # You may need this
$ yarn run serve
```

## Deployment to Firebase

#### Compiles and minifies for production

```
$ cp .env.local .env.production
$ export NODE_OPTIONS=--openssl-legacy-provider  # You may need this
$ yarn run build
```

#### Firebase setup
```
$ firebase login
```

Select project
```
$ firebase use --add
```

#### Deployment
```
$ firebase deploy --only hosting
```

