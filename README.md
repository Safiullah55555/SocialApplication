# SocialApp

A social media web application built with Next.js 15, React, and TypeScript. This app features user authentication, posting with images and videos, comments, edit & delete comments and posts, likes, notifications, search users, edit profile and a following system.

## visit live : https://social-application-omega.vercel.app/
## Technologies Used

- [Next.js](https://nextjs.org) - React framework for server-side rendering and static site generation
- [React](https://reactjs.org) - UI library
- [TypeScript](https://www.typescriptlang.org) - Typed JavaScript
- [Prisma](https://www.prisma.io) - ORM for database access
- [PostgreSQL](https://www.postgresql.org) - Relational database
- [Clerk](https://clerk.com) - Authentication and user management
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [Uploadthing](https://uploadthing.com) - File upload handling
- [Radix UI](https://www.radix-ui.com) - Accessible UI primitives

## Features

- User authentication and profile management
- Create, edit and delete posts with optional images
- Like and comment(and edit/delete) on posts
- Follow other users
- Real-time notifications for likes, comments, and follows
- Responsive design for desktop and mobile

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- PostgreSQL database
- Git

### Clone the repository

```bash
git clone https://github.com/Safiullah55555/SocialApplication
cd socialapp
```

### Install dependencies

Using npm:

```bash
npm install
```

Or using yarn:

```bash
yarn install
```

### Set up environment variables

Create a `.env` file in the root directory and add the following variables:

```env
DATABASE_URL=your_postgresql_database_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
UPLOADTHING_TOKEN=your_uploadthing_token
```

Replace the values with your actual credentials.

### Generate Prisma client

```bash
npx prisma generate
```

### Run database migrations (if any)

```bash
npx prisma migrate dev
```

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

### Build and start for production

```bash
npm run build
npm start
```

## Deployment

The easiest way to deploy this Next.js app is using [Vercel](https://vercel.com). Follow their documentation to connect your GitHub repository and deploy.


## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
