# Chat Evaluation Application

## Overview

The Chat Evaluation Application is designed to manage and evaluate chat interactions using various Large Language Model (LLM) API services. It allows users to upload datasets, generate prompts, and evaluate responses based on predefined criteria such as correctness and faithfulness. The application is built using a decoupling architecture with a frontend, backend. worker services.

## Features

- **Dataset Management**: Upload and manage datasets for chat evaluation.
- **Prompt Generation**: Generate prompts based on uploaded datasets.
- **Response Evaluation**: Evaluate chat responses using multiple LLM API services.
- **Progress Tracking**: Monitor the progress of ongoing evaluations.
- **Historical Data**: View previous chats and their evaluations.

## Architecture

- **Frontend**: Built with React, providing a user interface for managing datasets, generating prompts, and viewing evaluations.
- **Backend**: An Express.js server handling API requests, database interactions, and managing evaluation logic.
- **Workers**: Background workers using BullMQ for processing evaluation tasks asynchronously.
- **Database**: PostgreSQL for storing datasets, prompts, responses, and evaluations.
- **Queue**: Redis for managing task queues and ensuring efficient processing of evaluation jobs.

## Setup and Installation

### Prerequisites

- Docker and Docker Compose
- Node.js and npm (for local development)
- PostgreSQL and Redis (if not using Docker)

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/chat-evaluation-app.git
   cd chat-evaluation-app
   ```

2. **Environment Configuration**

   Create a `.env` file in the `backend` directory with the following variables:

   ```plaintext
   DATABASE_URL=postgres://postgres:mypassword@postgres_db:5432/llm_eval_db
   REDIS_HOST=redis
   REDIS_PORT=6379
   GROQ_API_KEY=your-groq-api-key
   GEMINI_API_KEY=your-gemini-api-key
   OPENAI_API_KEY=your-openai-api-key
   ```

3. **Docker Setup**

   Ensure Docker and Docker Compose are installed, then run:

   ```bash
   docker-compose up --build --scale prompt_worker=3 --scale template_worker=3
   ```

   This command will build and start all services, including the frontend, backend, database, and Redis, while scaling the `prompt_worker` and `template_worker` services to run three instances each. This scaling helps in processing tasks concurrently, improving the application's performance.

4. **Local Development (Optional)**

   If you prefer to run the application locally without Docker:

   - **Backend**: Navigate to the `backend` directory and run:

     ```bash
     npm install
     npm start
     ```

   - **Frontend**: Navigate to the `frontend` directory and run:

     ```bash
     npm install
     npm start
     ```

## Usage

1. **Access the Application**

   Open your browser and navigate to `http://localhost:5173` to access the frontend interface.

2. **Upload Datasets**

   Use the "Upload" page to upload CSV datasets for evaluation.

3. **Generate Prompts**

   Navigate to the "Generate Prompts" page to create prompts based on the uploaded datasets.

4. **Evaluate Responses**

   Start the evaluation process and monitor progress on the "Evaluation" page. The application uses multiple LLM API services to evaluate responses based on predefined criteria.

5. **View Previous Chats**

   Access the "Previous Chats" section to view historical chat data and their evaluations.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

## Contact

For questions or support, please contact [vaithiyanathan.veerappan@gmail.com].
