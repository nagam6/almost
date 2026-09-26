# All Most

**Museum of Mistakes** — a learning space where students explore common mistakes, discover the thinking behind them, and try again. This is an initial project structure for the team; the product flow and features are still to be designed together.

## Project structure

```text
All Most/
├── apps/
│   ├── web/             # React frontend
│   └── api/             # Express backend
├── .gitignore
├── package.json         # npm workspaces
└── README.md
```

## Run locally

Install Node.js, then from this folder:

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173
- Backend health check: http://localhost:5000/api/health

The frontend and API are connected through Vite's `/api` development proxy.

## First team decisions

- Agree on the first student journey and one subject for the demo.
- Decide how a mistake is submitted, reviewed, and explained.
- Divide the work into small GitHub issues before building features.

Suggested GitHub repository name: `all-most` (the folder name can stay `All Most`).
