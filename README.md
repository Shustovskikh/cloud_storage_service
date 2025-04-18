# [Cloud Storage Service](https://194.67.84.170/)

## Overview

Welcome to the Cloud Storage Service project! This comprehensive solution aims to provide a seamless and secure cloud storage experience, similar to popular services like Dropbox. The project is divided into two main parts: the backend and the frontend, each playing a crucial role in delivering a robust and user-friendly application.

### Backend

The backend is the heart of the Cloud Storage Service, built using Django, Django REST Framework, and PostgreSQL. It handles all the heavy lifting, including user authentication, file management, and asynchronous task processing. Here are some key features and components of the backend:

- **User Authentication and Management**: The backend supports user registration, login, and JWT-based authentication. It ensures that only authenticated users can access their files and perform actions. Admin users have additional privileges to manage all users and their files.
- **File Management**: The backend provides robust file management capabilities. Users can upload, download, and manage their files. The system ensures that each user can only access their own files, while admin users can view and manage all files.
- **Asynchronous Tasks**: The backend leverages Celery and Redis for handling asynchronous tasks. This ensures that long-running tasks, such as file processing, do not block the main application.
- **RESTful API**: The backend exposes a RESTful API that the frontend can interact with. This API follows REST principles, ensuring that all interactions are stateless and use standard HTTP methods.
- **Security**: The backend implements various security measures, including JWT for authentication, CORS for cross-origin requests, and secure storage of user data.

### Frontend

The frontend is the user-facing part of the Cloud Storage Service, built using React, Redux, and React Router. It provides an intuitive and responsive interface for users to interact with the backend. Here are some key features and components of the frontend:

- **User Interface**: The frontend offers a clean and intuitive user interface. Users can easily register, log in, and manage their files. The interface is designed to be responsive, ensuring a seamless experience across different devices.
- **File Management**: The frontend allows users to upload, download, and manage their files. It provides real-time updates and notifications, ensuring that users are always aware of the status of their files.
- **Admin Panel**: The frontend includes an admin panel that allows admin users to manage all users and their files. The admin panel provides a comprehensive view of all users and their activities.
- **Protected Routes**: The frontend ensures that only authenticated users can access certain routes. This adds an extra layer of security, ensuring that sensitive actions are protected.
- **State Management**: The frontend uses Redux for state management, ensuring that the application state is predictable and easy to manage.

### Integration

The backend and frontend are tightly integrated to provide a seamless user experience. The frontend communicates with the backend via RESTful API, ensuring that all actions are performed securely and efficiently. The use of WebSockets allows for real-time updates, ensuring that users are always aware of the status of their files.

### Deployment

The Cloud Storage Service is designed to be easily deployable. The backend can be deployed using Daphne for ASGI support, ensuring that WebSockets and other asynchronous features work seamlessly. The frontend can be built and deployed using modern build tools, ensuring that the application is optimized for production.

### Contributing

We welcome contributions from the community. Whether you want to add new features, fix bugs, or improve documentation, your contributions are valuable. Please follow the contributing guidelines to get started.

### License

This project is licensed under the ISC License. Feel free to use, modify, and distribute the code as per the terms of the license.

## Project Structure

### General structure
cloud_storage_service/
├──backend/
├──docs/
├──frontend/
├──.gitignore
├──README.md

### Backend

backend/
├── cloud_storage_service/
│   ├── init.py
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   ├── asgi.py
│   ├── celery.py
│   ├── middleware.py
├── users/
│   ├── init.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
├── files/
│   ├── init.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   ├── consumers.py
│   ├── routing.py
│   ├── tasks.py
├── media/
│   ├── uploads/
├── manage.py
├── requirements.txt
├── .env

### Frontend

frontend/
├── node_modules/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── api/
│   │   ├── auth.js
│   │   ├── file.js
│   │   ├── user.js
│   │   └── index.js
│   ├── components/
│   │   ├── ConfirmationModal/
│   │   │   ├── ConfirmationModal.jsx
│   │   │   ├── ConfirmationModal.css
│   │   ├── Header/
│   │   │   ├── Header.jsx
│   │   │   ├── Header.css
│   │   ├── FileList/
│   │   │   ├── AllUserFiles.js
│   │   │   ├── FileList.jsx
│   │   │   ├── FileList.css
│   │   ├── FileUploader/
│   │   │   ├── FileUploader.jsx
│   │   │   ├── FileUploader.css
│   │   ├── FileItem/
│   │   │   ├── FileItem.jsx
│   │   │   ├── FileItem.css
│   │   ├── UserTable/
│   │   │   ├── UserTable.jsx
│   │   │   ├── UserTable.css
│   │   ├── UserConfig/
│   │   │   ├── UserConfig.jsx
│   │   │   ├── UserConfig.css
│   │   ├── UserManagement/
│   │   │   ├── UserManagement.jsx
│   │   ├── Footer/
│   │   │   ├──Footer.css
│   │   │   ├──Footer.jsx
│   │   ├── FileConfig
│   │   │   ├── FileConfig.css
│   │   │   ├── FileConfig.jsx
│   ├── pages/
│   │   ├── Home/
│   │   │   ├── Home.jsx
│   │   │   ├── Home.css
│   │   ├── Login/
│   │   │   ├── Login.jsx
│   │   │   ├── Login.css
│   │   ├── Register/
│   │   │   ├── Register.jsx
│   │   │   ├── Register.css
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Dashboard.css
│   │   ├── NotFound/
│   │   │   ├── NotFound.jsx
│   │   │   ├── NotFound.css
│   │   ├── AdminPanel/
│   │   │   ├── AdminPanel.jsx
│   │   │   ├── AdminPanel.css
│   ├── routes.jsx
│   ├── App.jsx
│   ├── index.js
│   ├── store.js
│   ├── authSlice.js
│   ├── styles/
│   │   ├── index.css
│   │   ├── variables.css
│   │   └── common.css
│   └── utils/
│       └── helpers.js
├── .env
├── package.json
├── package-lock.json

## Installation

### Backend

1. Clone the repository:
    ```bash
    git clone <URL_REPOSITORY>
    cd cloud_storage_service/backend
    ```

2. Set up a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate    # For Linux/MacOS
    venv\Scripts\activate       # For Windows
    ```

3. Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4. Set up environment variables:
    Create a `.env` file in the `backend` directory and add the following settings:
    ```
    SECRET_KEY=django-insecure-=9cd#y&knba41j*44+s(n\\$-yqapem2=%*0^&^ko*2*u@9ow6up
    DEBUG=True
    DB_NAME=cloud_storage
    DB_USER=cloud_user
    DB_PASSWORD=cloud_password
    DB_HOST=localhost
    DB_PORT=5432
    ALLOWED_HOSTS=127.0.0.1,localhost
    ```

5. Set up the PostgreSQL database:
    ```sql
    CREATE DATABASE cloud_storage;
    CREATE USER cloud_user WITH PASSWORD 'cloud_password';
    GRANT ALL PRIVILEGES ON DATABASE cloud_storage TO cloud_user;
    ```

6. Apply migrations:
    ```bash
    python manage.py migrate
    ```

7. Create a superuser:
    ```bash
    python manage.py createsuperuser
    ```

8. Start Redis (for Celery):
    ```bash
    redis-server
    ```

9. Start Celery:
    ```bash
    celery -A cloud_storage_service worker --loglevel=info
    ```

10. Run the Django server:
    ```bash
    daphne -b 127.0.0.1 -p 8000 cloud_storage_service.asgi\:application
    ```

### Frontend

1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/cloud-storage-service-frontend.git
    cd cloud-storage-service-frontend
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory and add the following environment variables:
    ```bash
    nano .env
    ```

    Add to it:
    ```
    REACT_APP_API_URL=http://127.0.0.1:8000/api
    REACT_APP_WEBSOCKET_URL=ws://127.0.0.1:8000/ws/files/
    REACT_APP_ENV=development
    REACT_APP_DEBUG=true
    ```

## Running the Application

### Frontend

1. Start the development server:
    ```bash
    npm start
    ```

2. Open your browser and navigate to `http://localhost:3000`.

### Backend

1. Ensure the Django server is running:
    ```bash
    daphne -b 127.0.0.1 -p 8000 cloud_storage_service.asgi\:application
    ```

## Building for Production

### Frontend

The frontend runs without a separate build step. All static files are served from **`public/`**, and Webpack processes them dynamically at runtime.

## API Endpoints

### Authentication

- `POST /api/users/register/` — Register a new user  
- `POST /api/token/` — Obtain JWT tokens  
- `POST /api/token/refresh/` — Refresh JWT token  

### User Management

- `GET /api/users/` — Get a list of all users (admin only)  
- `DELETE /api/users/{userId}/` — Delete a user (admin only)  
- `GET /api/users/{userId}/` — Get user details (admin only)  
- `PUT /api/users/{userId}/` — Update user details (admin only)  

### File Management

- `GET /api/files/` — Retrieve a list of files  
- `POST /api/files/` — Upload a file  
- `DELETE /api/files/{fileId}/` — Delete a file  
- `PUT /api/files/{fileId}/update/` — Update file details  
- `GET /api/files/{fileId}/get_shared_link/` — Get a shared link for a file  

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Create a new Pull Request

## License

This project is licensed under the ISC License.

# Project Deployment on Cloud Server (VPS reg.ru)

## General Information

The project is deployed and available at: [https://194.67.84.170/](https://194.67.84.170/)

## Preliminary Steps

1. Register at [reg.ru](https://www.reg.ru/).
2. Create a new VPS server.
3. Choose the operating system: **Ubuntu 24.04 LTS**.

## Connecting to the Server

```bash
ssh username@<IP-адрес>
```

## Installing Required Packages

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-venv python3-pip postgresql postgresql-contrib redis nodejs npm nginx git
```

Check versions:

```bash
python3 --version
pip3 --version
psql --version
redis-server --version
node -v
npm -v
```

## Cloning the Repository

```bash
git clone https://github.com/yourusername/cloud_storage_service.git
cd cloud_storage_service
```

---

# Backend Configuration

## Installing Dependencies

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Configuration Setup

Create the `.env` file:

```bash
nano .env
```

Add:

```env
SECRET_KEY=django-insecure-xxxxxxxxxxxxxxxxxx
DEBUG=False
DB_NAME=cloud_storage
DB_USER=cloud_user
DB_PASSWORD=cloud_password
DB_HOST=194.67.84.170
DB_PORT=5432
ALLOWED_HOSTS=localhost,<IP-адрес>,127.0.0.1
```

## PostgreSQL Database Setup

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE cloud_storage;
CREATE USER cloud_user WITH PASSWORD 'cloud_password';
ALTER ROLE cloud_user SET client_encoding TO 'utf8';
ALTER ROLE cloud_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE cloud_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE cloud_storage TO cloud_user;
\q
```

## Migrations and Superuser

```bash
python manage.py migrate
python manage.py createsuperuser
```

## Collecting Static Files

```bash
python manage.py collectstatic
```

## Setting Up and Running Daphne

```bash
sudo nano /etc/systemd/system/daphne.service
```

```ini
[Unit]
Description=Daphne server
After=network.target

[Service]
User=evgen
WorkingDirectory=/home/evgen/cloud_storage_service/backend
ExecStart=/home/evgen/cloud_storage_service/backend/venv/bin/daphne -b 0.0.0.0 -p 8000 cloud_storage_service.asgi:application
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl start daphne
sudo systemctl enable daphne
sudo systemctl status daphne
```

---

## NGINX Configuration

To ensure proper routing of requests to the backend and serving of static files, configure Nginx as follows.

### Step 1: Create Nginx Configuration File

Open or create the configuration file for your project:

```bash
sudo nano /etc/nginx/sites-available/cloud_storage_service
```

### Step 2: Add the Configuration

Copy and paste the following configuration into the file:

```nginx
server {
    listen 80;
    server_name <YOUR_SERVER_IP>;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name <YOUR_SERVER_IP>;

    ssl_certificate /etc/ssl/certs/selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/selfsigned.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # ======= Frontend Configuration =======
    root /home/evgen/cloud_storage_service/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(?:js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|otf|eot|woff)$ {
        expires 30d;
        access_log off;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # ======= API Backend Configuration =======
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_cache_bypass $http_upgrade;
    }

    location /static/ {
        alias /home/evgen/cloud_storage_service/backend/staticfiles/;
        autoindex on;
        expires 30d;
        add_header Cache-Control "public";
    }

    location /media/ {
        alias /home/evgen/cloud_storage_service/backend/media/;
    }

    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_cache_bypass $http_upgrade;
    }

    # ======= Logging =======
    access_log /var/log/nginx/frontend_access.log;
    error_log /var/log/nginx/frontend_error.log;

    # Custom 404 Page
    error_page 404 /404.html;
    location = /404.html {
        root /usr/share/nginx/html;
    }
}
```

### Step 3: Enable the Configuration

Create a symbolic link to enable the configuration:

```bash
sudo ln -s /etc/nginx/sites-available/cloud_storage_service /etc/nginx/sites-enabled/
```

### Step 4: Verify and Restart Nginx

Check if the configuration is correct:

```bash
sudo nginx -t
```

If there are no errors, restart Nginx:

```bash
sudo systemctl restart nginx
```

### Step 5: Check Nginx Status

To verify that Nginx is running properly, use:

```bash
sudo systemctl status nginx
```

### Step 6: Test the Setup

Ensure Nginx is serving requests correctly:

```bash
curl -Ik https://<IP-address>
```

This should return a valid HTTP response confirming that Nginx is working properly.