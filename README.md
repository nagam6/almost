# Almost

### Almost right. Worth another thought.

**Almost** is a Museum of Mistakes: a place to understand *why* an answer went wrong and what we can learn from it. Students investigate mistakes, teachers create exhibits from common misconceptions, and the AI Code Lab lets learners catch and correct an AI-generated coding mistake.

![Almost home page](docs/images/homepage.png)

## Why Almost?

The project was built for the theme **“Imagine education in the future.”** Instead of treating a wrong answer as the end of learning, Almost turns it into an exhibit: something to explore, discuss, and repair.

## Explore the museum

The demo has two rooms: **Math** and **JavaScript**. Visitors can browse published teacher exhibits. In the JavaScript room, signed-in users can choose between:

- **Teacher Exhibits:** questions and intentionally wrong solutions created by teachers.
- **Fix the AI:** short JavaScript challenges in which the AI makes one deliberate mistake.

For a teacher exhibit, a student reads the question and wrong solution, chooses where the reasoning failed, and can optionally describe their thinking. After submitting, they see feedback for their choice and the explanation. The **first answer is saved**; Try Again is available for practice and does not overwrite it.

In Fix the AI, a learner can **choose the mistake** or **correct one line of code**. The backend checks the answer and returns an explanation. Student code is compared as text and is never executed. If a live challenge fails validation or generation is temporarily unavailable, the API may serve a clearly labeled reviewed challenge.

## Teacher Studio

A teacher can create and preview an exhibit, edit or delete it while it is a draft, and publish it to the museum. Published exhibits can be archived and later restored. Published content is read-only; a correction needs a new exhibit.

Teachers see anonymous, aggregate results for exhibits they own, including answer counts and accuracy. Student names, emails, IDs, and written reasoning are not shown in those summaries.

## Accounts and roles

Users register as a **Student** or **Teacher**, then log in to access the appropriate features. Accounts also include a profile and password reset by email when SMTP is configured. Teacher identity is not verified in this demo; the role is selected during registration.

The museum is shared by all users. Classes, student-submitted exhibits, and teacher review queues are outside the current demo.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React, React Router, Vite, CSS, React Toastify |
| Backend | Node.js, Express |
| Database | MongoDB Atlas, Mongoose |
| AI challenges | OpenAI API through the backend |
| Authentication | JWT stored in an HTTP-only cookie |

## Run locally

Install Node.js and npm. From the repository root:

```bash
npm install
```

Create `apps/api/.env` with your own values:

```dotenv
PORT=5000
MONGODB_URI=your_mongodb_connection_string
AUTH_SECRET=your_random_secret_of_at_least_32_characters
APP_URL=<your-production-url>

# Required for Fix the AI:
OPENAI_API_KEY=your_openai_api_key

# Required for password-reset emails:
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
MAIL_FROM=your_sender_email
```

`MONGODB_URI`, `AUTH_SECRET`, and `APP_URL` are required for the API. Without `OPENAI_API_KEY`, Fix the AI is unavailable. SMTP settings are needed to send password-reset emails. Keep `.env` private and never place secret keys in the frontend.

Start both apps:

```bash
npm run dev
```


- API health check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

The frontend calls relative `/api` URLs. During development, Vite proxies those requests to the API.

For a new, empty database, add the demo content:

```bash
npm run seed:rooms --workspace apps/api
npm run seed:exhibits --workspace apps/api
```

Build the frontend with `npm run build`. Its output is in `apps/web/dist`.

## Project structure

```text
apps/
  api/
    src/
      config/       Database connection
      middleware/   Authentication
      models/       MongoDB models
      routes/       API routes
      scripts/      Demo data scripts
  web/
    src/
      components/   Shared interface components
      pages/        Museum, AI, account, and teacher screens
      services/     API calls
      styles/       Global styles
docs/
  images/           README screenshot
  requirements/     Product requirements
```

## Online demo

The static frontend can be hosted on Netlify, but the Express API needs separate hosting. Production must route `/api` to the API host and provide the backend with its MongoDB connection and other environment variables. Set `APP_URL` to the public HTTPS website origin.

---

**Almost** — every mistake is a clue.