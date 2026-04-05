# Simple Blog

A minimal Node.js web service using Express for a simple anonymous blog with comments.

## Features

- Serves a simple blog webpage at "/" displaying:
  - Title
  - Version string (v0.1)
  - List of posts with comments
- Stores posts and comments in a JSON file (`posts.json`)
- Anonymous commenting system with auto-assigned names (익명1, 익명2, etc.)
- Same user gets the same anonymous name for each post
- Add new posts with a simple form
- Add comments to existing posts

## Patch Notes (Latest Updates)

### DevOps & CI/CD Pipeline
- **Automated CI/CD Integration**: Fully integrated with GitHub Actions (`ci.yml`, `deploy.yml`) using a self-hosted runner.
- **Docker Port Fix**: Mapped host port `8080` to container port `3000` to prevent Windows Hyper-V port collision issues.
- **Visual Deployment Check**: Dynamic injection of Git Commit Hash (`APP_VERSION`) and Build Timestamp (`DEPLOY_TIME`) at the top of the webpage.
- **Health Check API**: Added `/health` endpoint to monitor server uptime, app version, and deployment time.

### UI & UX Improvements
- **Rainbow Anonymous Nicknames**: Automatic assignment of rainbow-colored nicknames (Red, Orange, Yellow, Green, Blue, Indigo, Violet) to anonymous commenters based on sequence digits.
- **Author Nickname Highlight**: Enforced default black color highlighting for original post authors.
- **Custom Nickname Color Picker**: Added a color picker (`<input type="color">`) in post & comment forms, allowing users to override default nicknames with their own personalized colors.

## Prerequisites

- Node.js (v18 or later)
- npm

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```

## Running Locally

Start the server:
```
node server.js
```

The app will run on `http://localhost:3000`.

## API Endpoints

- **GET /**: Displays the main webpage with posts and comments
- **POST /add-post**: Adds a new post (form data: title, content)
- **POST /add-comment**: Adds a comment to a post (form data: postId, content)

## Docker

### Build the Image
```
docker build -t simple-web-service .
```

### Run the Container
```
docker run -p 3000:3000 simple-web-service
```

## Project Structure

```
simple-web-service/
├── .github/
│   └── workflows/
│       └── ci.yml
├── Dockerfile
├── .dockerignore
├── package.json
├── server.js
├── posts.json
└── README.md
```

## License

MIT