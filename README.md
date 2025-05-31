# docflow-admin
> Document processing system

This repository contains the source code for Admin Web Application (React) for a document processing system. The web app is a dashboard for administrators to set up destinations for different file types and to define layouts for a Processing Server. The Server interacts with a client app for Windows Desktop. The Processing Server and Windows App are developed separately as [si-docflow-server](https://github.com/kanitakadusic/si-docflow-server) and [si-docflow-windows](https://github.com/kanitakadusic/si-docflow-windows).


## Table of Contents

- [Target Environment](#target-environment)
- [Software Dependencies](#software-dependencies)
- [Installation and Configuration](#installation-and-configuration)
  - [Installing Node.js, npm, PostgreSQL, and Git](#installing-nodejs-npm-postgresql-and-git)
  - [Environment Variables (.env)](#environment-variables-env)
    - [Google OAuth Environment Variables](#google-oauth-environment-variables)
- [Steps to Initialize the System](#steps-to-initialize-the-system)
  - [Database Deployment](#database-deployment)
    - [Running Database Migrations](#running-database-migrations)
    - [Seeding the Database (Test Data)](#seeding-the-database-test-data)
  - [Docflow Admin Deployment](#docflow-admin-deployment)
- [About the Project](#about-the-project)
  - [Architecture](#architecture)
  - [Continuous Integration / Continuous Deployment (CI/CD)](#continuous-integration--continuous-deployment-cicd)
  - [Network and Security](#network-and-security)
  - [Rollback and Recovery](#rollback-and-recovery)
  - [Monitoring and Logging](#monitoring-and-logging)
  - [User Access and Roles](#user-access-and-roles)
  - [Testing in Deployment Environment](#testing-in-deployment-environment)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Target Environment

* Linux, macOS, or Windows VM (Cloud or Local)
* Hardware requirements (CPU, RAM, storage, GPU, etc.):
    * Min 2 CPU cores (scaled with usage)
    * Min 1GB RAM (scaled with usage)
    * Min 1GB storage (scaled with usage)
    * No GPU is needed


## Software Dependencies

* Node.js v18+ (cross-platform)
* npm (comes with Node.js)
* React (create-react-app)
* PostgreSQL (local or remote, version 12+ recommended)
* Git
* Containerization handled by cloud provider (optional)


# Installation and Configuration

**No installation of this software is needed, but dependencies must be installed.**

## Installing Node.js, npm, PostgreSQL, and Git

### Node.js & npm


- **Windows/macOS:**  
  Download and install from [https://nodejs.org/](https://nodejs.org/) (LTS version recommended).  
  npm is included with Node.js.


- **Linux (Debian/Ubuntu):**
    ```sh
    sudo apt update
    sudo apt install nodejs npm
    ```


- **Verify installation:**
    ```sh
    node -v
    npm -v
    ```


### PostgreSQL


- **Windows/macOS:**  
  Download installer from [https://www.postgresql.org/download/](https://www.postgresql.org/download/)


- **Linux (Debian/Ubuntu):**
    ```sh
    sudo apt update
    sudo apt install postgresql postgresql-contrib
    ```


- **Verify installation:**
    ```sh
    psql --version
    ```


### Git


- **Windows/macOS:**  
  Download from [https://git-scm.com/downloads](https://git-scm.com/downloads)


- **Linux (Debian/Ubuntu):**
    ```sh
    sudo apt update
    sudo apt install git
    ```


- **Verify installation:**
    ```sh
    git --version
    ```

## Environment Variables (.env)

The application requires a `.env` file in the `/backend` folder to configure sensitive and environment-specific settings. Below are the required variables and example values:

### `DATABASE_URL`

**Description:**  
The connection string for your PostgreSQL database. This tells the backend where to find and how to connect to your database instance.

**Example values:**
- For a local database:
  ```env
  DATABASE_URL=postgresql://user:password@localhost:5432/mydatabase
  ```
- For a remote database:
  ```env
  DATABASE_URL=postgresql://user:password@remotehost:5432/mydatabase
  ```

### `SESSION_SECRET`

**Description:**  
A secret key used to sign and verify tokens, and to encrypt session data. This is important for maintaining user session security.

**Example value:**
- A long, random string, for example:
  ```env
  SESSION_SECRET=supersecretkey123456
  ```

**Tip:**  
You can generate a secure random string using Node.js:
```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Note:**  
Ensure that these variables are set in your `.env` file before starting the application.

### Google OAuth Environment Variables

To enable Google Single Sign-On (SSO), you must set the following variables in your `.env` file (see `.env.example` for reference):

- `GOOGLE_CLIENT_ID`  
  The Client ID from your Google Cloud OAuth 2.0 credentials.

- `GOOGLE_CLIENT_SECRET`  
  The Client Secret from your Google Cloud OAuth 2.0 credentials.

- `GOOGLE_CALLBACK_URL`  
  The callback URL registered in your Google Cloud project (must match the URL configured in the Google Cloud Console, e.g., `https://your-domain.com/auth/google/callback`).

**How to obtain these values:**
1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and log in
2. Create a new project or select an existing one (top left of the screen).
3. Open the menu on the left side of the screen and navigate to "APIs & Services" > "Credentials". You will be prompted to configure a consent screen - this is mandatory.
4. Click "Create Credentials" > "OAuth client ID".
5. Set the application type to "Web application".
6. Add your authorized redirect URI (e.g., `https://your-domain.com/auth/google/callback`).
7. Copy the generated Client ID and Client Secret into your `.env` file.
8. Set `GOOGLE_CALLBACK_URL` to the same redirect URI you registered.

**Example:**
```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-domain.com/auth/google/callback
```

# Steps to initialize the system (universal)

## Database Deployment


* PostgreSQL is required DBMS (local or remote, version 12+ recommended)
* Initialization scripts can be run with `npm run migrate` from `si-docflow-admin/backend`
* Hosting can be local, cloud, or a managed DB
* Depends only on `DATABASE_URL` connection string in `.env`

### Running Database Migrations

Before you can start database migrations, you must prepare .env variables as described in previous section.
To initialize or update the database schema, run the migration scripts using the following command from the `/backend` directory:

```sh
npm run migrate
```

This command will apply all necessary migrations to set up or update the database structure as required by the application.

**Note:**  
- Ensure your `DATABASE_URL` is correctly set in your `.env` file before running migrations.
- Running migrations will not erase existing data, but will update the schema as needed.
- Always back up your database before running migrations in a production environment.

### Seeding the Database (Test Data)

You can populate the database with generic test/demo data using the following command from the `/backend` directory:

```sh
npm run seed
```

**Warning:**  
The seed data is generic and intended for development and testing purposes only.  
**Do not use this command in production environments.**  
Running this command will erase all existing data in the database and replace it with default test data.

## Docflow Admin Deployment

1. Clone latest version from dev branch:
    ```sh
    git clone https://github.com/HarisMalisevic/si-docflow-admin
    cd si-docflow-admin
    ```

2. Install dependencies using the provided script:
    ```sh
    npm run dependencies
    ```

3. Create `.env` file in `/backend` folder (based on `.env.example`) with `DATABASE_URL` and `SESSION_SECRET`

4. Set `DATABASE_URL` to a valid PostgreSQL DB (local or remote)

5. Set `SESSION_SECRET` to a secure random string

6. Write Google OAuth variables in .env.
More at [Google OAuth Environment Variables](#google-oauth-environment-variables)

7. Build the project:
    ```sh
    npm run build
    ```

8. From `./backend`, run database migrations (if DB is not set up already):
    ```sh
    npm run migrate
    ```

    **Note:**
    You can run `npm run seed` to populate the database with starting default data for development and testing.  
    To change the default starting data, edit the files in `backend/src/migrations/seed_data`.

9. Start the application:
    ```sh
    npm run start
    ```


# About the project

## Architecture

The component diagram of the system is provided below.<br><br>

![System architecture](documentation/systemArchitecture.jpg)



## Continuous Integration / Continuous Deployment (CI/CD)

No CI/CD tools are used on code repository, latest version is pulled by cloud provider

After pushing to dev branch, latest version must be approved on cloud provider


## Network and Security

* Default Port 5000 (can be different based on cloud provider)
* SSL/TLS requirements are handled by cloud provider automatically (HTTPS with TLS certificates)


**Authentication mechanisms in app:**
- OAuth 2.0 with 3rd party providers
- JWT with fixed duration


## Rollback and Recovery

* Deployment rollback depends on cloud provider
* Backup procedures not needed as there is no production data of meaningful value


## Monitoring and Logging

* Runtime logs are generated and printed to deployment console
* Data transactions are logged and stored in appropriate DB table


## User Access and Roles

**Who can access the deployed system?**
- Users who pass login in deployed application
- Development team members with production DB connection access


**How are users provisioned and managed?**
- Handled in DB
- Currently any user can register as initial development is in progress

## Testing in Deployment Environment

* Smoke testing or sanity check procedures post-deployment are currently not automatic


## License

This project is licensed under a **Custom Non-Commercial License**.  
You are free to use, study, and modify the code for personal or educational purposes.  
**Commercial use is strictly prohibited** without prior written permission from the authors.

### Acknowledgments

Some course teammates were part of the group assignment but did not contribute significantly to the development of this web application. 

Primary authors and developers:  
- Bečić Nedim
- Hrustić Ajla
- Kurtović Esma 
- Mališević Haris

© 2025 Bečić Nedim, Hrustić Ajla, Kurtović Esma, Mališević Haris