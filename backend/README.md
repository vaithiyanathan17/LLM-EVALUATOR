# Chat Evaluation Application - Backend

## Overview

The backend of the Chat Evaluation Application is responsible for handling API requests, managing database interactions, and processing evaluation tasks using various Large Language Model (LLM) API services. It is built with Express.js and utilizes PostgreSQL for data storage and Redis for task queue management.

## Features

- **API Services**: Provides endpoints for dataset management, prompt generation, and response evaluation.
- **Task Processing**: Utilizes BullMQ to handle background tasks for evaluating chat responses.
- **Database Management**: Interacts with PostgreSQL to store datasets, prompts, responses, and evaluations.
- **Scalable Architecture**: Supports scaling of worker services to handle increased load.

## Prerequisites

- Node.js and npm
- Docker and Docker Compose (for containerized deployment)
- PostgreSQL
- Redis

## Setup and Installation

### Clone the Repository

```bash
git clone https://github.com/yourusername/chat-evaluation-app.git
cd chat-evaluation-app/backend
```

### Environment Configuration

Create a `.env` file in the `backend` directory with the following variables:

```plaintext
DATABASE_URL=postgres://postgres:mypassword@postgres_db:5432/llm_eval_db
REDIS_HOST=redis
REDIS_PORT=6379
GROQ_API_KEY=your-groq-api-key
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
```

### Local Development

1. **Install Dependencies**

   Ensure you have Node.js and npm installed, then run:

   ```bash
   npm install
   ```

2. **Run the Server**

   Start the Express.js server:

   ```bash
   npm start
   ```

   The server will start on `http://localhost:3000`.

### Docker Deployment

1. **Build and Start Services**

   Ensure Docker and Docker Compose are installed, then run:

   ```bash
   npm run docker:build
   npm run docker:run
   ```

   This command will build and start the backend service along with the necessary database and Redis services, scaling the worker services for better performance.

## API Endpoints

### Dataset Management

- **Upload Dataset**: `POST /api/datasets/upload-dataset`
- **Get Datasets**: `GET /api/datasets`

### Prompt Generation

- **Generate Prompts**: `POST /api/prompts/generate`

### Response Evaluation

- **Start Evaluation**: `POST /api/evaluation/start`
- **Get Evaluation Progress**: `GET /api/evaluation/progress`
- **Get Evaluations**: `GET /api/evaluation`

### Previous Chats

- **Get Previous Chats**: `GET /api/chats`
- **Get Evaluations for Chat**: `GET /api/chats/:chatId/evaluations`

## Task Processing

The backend uses BullMQ to manage task queues for evaluating responses. Workers are defined to process these tasks asynchronously, allowing for scalable and efficient processing.

## Database

The backend uses PostgreSQL to store all necessary data. Ensure the database is correctly set up and accessible via the `DATABASE_URL` specified in the `.env` file.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

## Contact

For questions or support, please contact [vaithiyanathan.veerappan@gmail.com].