# Chat Evaluation Application - Frontend

## Overview

The frontend of the Chat Evaluation Application provides a user-friendly interface for managing datasets, generating prompts, and viewing evaluations. It is built with React and interacts with the backend services to facilitate chat evaluation tasks.

## Features

- **Dataset Management**: Upload and manage datasets for chat evaluation.
- **Prompt Generation**: Generate prompts based on uploaded datasets.
- **Response Evaluation**: View evaluation progress and results.
- **Historical Data**: Access previous chats and their evaluations.

## Prerequisites

- Node.js and npm
- Docker and Docker Compose (for containerized deployment)

## Setup and Installation

### Clone the Repository

```bash
git clone https://github.com/yourusername/chat-evaluation-app.git
cd chat-evaluation-app/frontend
```

### Environment Configuration

Create a `.env` file in the `frontend` directory with the following variables:

```plaintext
REACT_APP_API_URL=http://localhost:3000/api   (or)
REACT_APP_API_URL=http://backend:3000/api     (if running in docker)
```

This variable should point to the backend API URL.

### Local Development

1. **Install Dependencies**

   Ensure you have Node.js and npm installed, then run:

   ```bash
   npm install
   ```

2. **Run the Development Server**

   Start the React development server:

   ```bash
   npm run dev
   ```

   The application will start on `http://localhost:5173`.

### Docker Deployment

1. **Build and Start Services**

   Ensure Docker and Docker Compose are installed, then run:

   ```bash
   docker-compose up --build
   ```

   This command will build and start the frontend service along with the necessary backend, database, and Redis services.

## Usage

1. **Access the Application**

   Open your browser and navigate to `http://localhost:5173` to access the frontend interface.

2. **Upload Datasets**

   Use the "Upload" page to upload CSV datasets for evaluation.

3. **Generate Prompts**

   Navigate to the "Generate Prompts" page to create prompts based on the uploaded datasets.

4. **Evaluate Responses**

   Start the evaluation process and monitor progress on the "Evaluation" page.

5. **View Previous Chats**

   Access the "Previous Chats" section to view historical chat data and their evaluations.

## Project Structure

Here's a general idea of what your project structure might look like. Please adjust based on your actual structure:

- **src/components**: Contains reusable React components.
- **src/pages**: Contains page components that represent different views in the application.

- TODO:
    - **src/services**: Contains services for API interactions.
    - **src/hooks**: Custom hooks for shared logic (if applicable).
    - **src/utils**: Utility functions and helpers (if applicable).

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

## Contact

For questions or support, please contact [vaithiyanathan.veerappan@gmail.com].
