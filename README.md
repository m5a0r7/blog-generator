# AI Blog Generator

A powerful, AI-driven blog content generation platform built with Next.js, Prisma, PostgreSQL, and AI integration.

## Features

- **AI-Powered Content Generation**: Create high-quality blog posts on any topic using advanced AI models
- **Feedback System**: Provide feedback on generated content and get improved versions
- **Version History**: Track all versions of your blog posts
- **User Authentication**: Secure login and registration system
- **Responsive Design**: Works on desktop and mobile devices
- **Docker Support**: Easy deployment with Docker and Docker Compose

## Tech Stack

- **Frontend**: Next.js 15, React 19, Chakra UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **AI Integration**: OpenAI/Groq API
- **Authentication**: JWT-based authentication
- **Deployment**: Docker, Railway

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose (for containerized setup)
- PostgreSQL (if running without Docker)
- OpenAI or Groq API key

### Environment Variables

Create a `.env` file with the following variables:

```
DATABASE_URL="your-database-url"
GROQ_API_KEY="your-groq-api-key"
OPENAI_API_KEY="your-openai-api-key"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="your-jwt-secret"
PORT="3000"
```

### Running with Docker

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/blog-generator.git
   cd blog-generator
   ```

2. **Set up environment variables**

   - Update the `.env` with your values

3. **Build and start the application**

   ```bash
   docker-compose up --build
   ```

4. **Access the application**

   - Open your browser and navigate to http://localhost:3000

5. **Run database migrations (first time setup)**

   ```bash
   docker-compose exec web npx prisma migrate deploy
   ```

6. **Stopping the application**

   ```bash
   docker-compose down
   ```

7. **View logs**
   ```bash
   docker-compose logs -f
   ```

### Development with Docker

For development with hot-reloading:

```bash
# In docker-compose.yml, uncomment the line:
# command: npm run dev

# Then start the containers
docker-compose up
```

### Running Locally (Without Docker)

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (update DATABASE_URL to point to your local PostgreSQL)
4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

### Railway Deployment

1. Push your code to GitHub
2. Connect your repository to Railway
3. Add a PostgreSQL database service
4. Set the required environment variables
5. Deploy your application

### Fly.io Deployment

1. Install the Fly CLI

   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. Login to Fly

   ```bash
   fly auth login
   ```

3. Launch your app

   ```bash
   fly launch
   ```

4. Deploy your app
   ```bash
   fly deploy
   ```

## Project Structure

```
blog-generator/
├── prisma/                # Prisma schema and migrations
├── public/                # Static assets
├── src/
│   ├── app/               # Next.js app directory
│   │   ├── api/           # API routes
│   │   ├── components/    # React components
│   │   └── ...            # Page routes
│   ├── lib/               # Utility functions
│   └── ...
├── .env                   # Environment variables
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile             # Docker configuration
└── package.json           # Project dependencies
```

## Key Features Explained

### AI Content Generation

The application uses OpenAI/Groq API to generate blog content based on user-provided topics. The generation process is handled by the `/api/generate` endpoint.

### Feedback and Improvement System

Users can provide feedback on generated content:

- **Positive Feedback**: Save the current version
- **Negative Feedback**: Provide improvement suggestions and get an enhanced version

### Version History

All versions of a blog post are saved and can be accessed through the history feature, allowing users to track changes and improvements over time.

## Docker Configuration

The application is containerized using Docker:

- **Dockerfile**: Configures the Node.js environment and builds the application
- **docker-compose.yml**: Sets up the application and PostgreSQL database services
- **docker-entrypoint.sh**: Handles database migrations and application startup

## Database Schema

The application uses Prisma with PostgreSQL and includes the following models:

- **User**: User authentication and profile information
- **Blog**: Blog posts with topics and metadata
- **Version**: Different versions of blog content
- **Feedback**: User feedback on generated content

## License

This project is licensed under the MIT License - see the LICENSE file for details.
