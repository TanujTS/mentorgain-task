# Mentorgain

Mentorgain is a mentorship program management platform designed to streamline the creation, enrollment, and management of mentorship programs. It features role-based access control system, dynamic form builder for applications, and dedicated dashboards for Users, Admins, and Superadmins.

## Deployment

-   **Frontend**: [mentorgain.tanujts.me](https://mentorgain.tanujts.me) (Hosted on Vercel)
-   **Backend**: [mentorgain-api.tanujts.me](https://mentorgain-api.tanujts.me) (Hosted on AWS EC2 via Docker)

## Architecture

The project is a monorepo managed with **pnpm workspaces**, ensuring efficient build and development workflows.

### Tech Stack

#### **Frontend (`apps/web`)**
-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React 19)
-   **Styling**: [TailwindCSS v4](https://tailwindcss.com/)
-   **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix Primitives) & [HeroUI](https://heroui.com/)
-   **State Management**: [TanStack Query](https://tanstack.com/query/latest) (React Query)
-   **Forms**: React Hook Form + Zod Validation
-   **Auth**: Better Auth Client

#### **Backend (`apps/api`)**
-   **Framework**: [NestJS 11](https://nestjs.com/)
-   **Database**: PostgreSQL (NeonDB Serverless)
-   **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
-   **Authentication**: Better Auth
-   **Validation**: Via DTOs provided by NestJS

#### **DevOps & Tools**
-   **Package Manager**: pnpm
-   **Containerization**: Docker
-   **Monorepo**: pnpm workspaces

### Database Schema

The system relies on a relational Postgres schema designed for flexibility:

-   **Users & Auth**: `user`, `session`, `account` (Managed by Better Auth).
-   **Programs**: `mentorship_program` (Created by admins, holds metadata like keys dates and capacity).
-   **Dynamic Forms**:
    -   `form_field`: Definitions of custom fields (Text, Select, File, etc.) linked to a program.
    -   `form_response`: actual answers provided by applicants, linked to their enrollment.
-   **Enrollments**: `enrollment` links Users to Programs with status tracking (`pending`, `accepted`, `rejected`).

### Features & Roles

#### 1. Program User
-   **View Programs**: Browse all open mentorship programs.
-   **Apply**: Fill out dynamic application forms tailored for each program (e.g., motivation, experience).
-   **Status Tracking**: View the status of their applications (Pending, Accepted, Rejected).
-   **Validation**: System prevents duplicate enrollments significantly.

### 2. Program Admin
-   **Create Programs**: customizable programs with start/end dates, max participants, and descriptions.
-   **Dynamic Forms**: Build custom application forms for each program with various field types (Text, Number, Select, etc.).
-   **Manage Enrollments**: View applicants, review responses, and accept or reject applications.
-   **Dashboard**: Overview of their created programs and active students.

### 3. Superadmin
-   **Platform Oversight**: View high-level statistics (Total Users, Programs, Enrollments).
-   **Global Management**: Ability to view, edit, and manage ALL programs and enrollments across the platform.
-   **User Management**: Manage user roles (promote/demote admins) 

## Setup & Local Development

### Prerequisites
-   Node.js (LTS)
-   pnpm
-   PostgreSQL
-   Docker (optional)

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd mentorgain-task
    ```

2.  **Install dependencies**
    ```bash
    pnpm install
    ```

3.  **Environment Setup**
    Create `.env` files in `apps/api` and `apps/web`.
    
    *   **apps/api/.env**:
        ```env
        DB_URL="postgresql://user...."
        PORT=8000
        BETTER_AUTH_SECRET="your_generated_secret"
        WEB_URL="http://localhost:3000"
        GOOGLE_CLIENT_ID="your_google_client_id"
        GOOGLE_CLIENT_SECRET="your_google_client_secret"
        API_URL="http://localhost:8000"
        ```
    *   **apps/web/.env**:
        ```env
        NEXT_PUBLIC_API_URL="http://localhost:8000"
        NEXT_PUBLIC_WEB_URL="http://localhost:3000"
        ```
    
    *   **Common Env (for Docker)**:
        ```env
        API_URL="http://localhost:8000"
        ```

4.  **Database Migration**
    ```bash
    cd apps/api
    pnpm db:push
    ```

5.  **Run Development Server**
    From the root directory:
    ```bash
    pnpm run dev
    ```
    This command starts both the frontend (User/Admin Web App) and the backend (API) concurrently using pnpm.

### Docker Support

The backend includes a `Dockerfile` for containerized deployment.
To build and run the backend container:
```bash
docker build -t mentorgain-api .
docker compose up -d
```
