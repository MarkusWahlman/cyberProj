# CyberProj

A monorepo web application containing a frontend, backend, and shared libraries.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:
- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/installation)

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd cyberProj
   ```

2. **Install dependencies:**
   Since this is a `pnpm` workspace, install dependencies at the root level.
   ```bash
   pnpm install
   ```

3. **Environment Variables:**
   Make sure to create any necessary `.env` files. For the backend, create `backend/.env` with your environment variables (the Docker setup relies on this file).

## Running the Application

The project uses Docker Compose to run the frontend, backend, and PostgreSQL database simultaneously.

**Start the development environment:**
```bash
pnpm run dev
```
*(This runs `docker compose up --build -V` under the hood)*

- **Frontend:** Accessible at `http://localhost:5173`
- **Backend:** Accessible at `http://localhost:3000`
- **Database:** PostgreSQL exposed on port `5432`
