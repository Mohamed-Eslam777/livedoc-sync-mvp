# Saned - AI-Powered Assistance Platform

Django backend for an AI-powered assistance platform connecting people with disabilities with volunteers.

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- MySQL Server installed and running
- pip (Python package manager)

### Installation Steps

1. **Activate Virtual Environment**

   ```powershell
   .\venv\Scripts\activate
   ```

2. **Configure Database Credentials**

   Edit the `.env` file in the project root and update with your MySQL credentials:

   ```env
   DB_NAME=saned_db
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_HOST=localhost
   DB_PORT=3306
   ```

3. **Create MySQL Database**

   Connect to MySQL and create the database:

   ```sql
   CREATE DATABASE saned_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. **Run Database Migrations**

   ```powershell
   python manage.py migrate
   ```

5. **Create Superuser (Optional)**

   ```powershell
   python manage.py createsuperuser
   ```

6. **Start Development Server**

   ```powershell
   python manage.py runserver
   ```

7. **Access the Application**
   - Main application: <http://127.0.0.1:8000/>
   - Admin panel: <http://127.0.0.1:8000/admin/>

## 📁 Project Structure

```
Sanad/
├── saned/                    # Main Django project
│   ├── settings.py          # Project settings (MySQL, REST, CORS configured)
│   ├── urls.py              # URL routing
│   ├── wsgi.py              # WSGI application
│   └── asgi.py              # ASGI application
├── core/                     # Core application
│   ├── models.py            # Database models (empty - ready for your models)
│   ├── views.py             # API views
│   ├── admin.py             # Admin configuration
│   └── migrations/          # Database migrations
├── venv/                     # Virtual environment
├── requirements.txt          # Python dependencies
├── .env                      # Environment variables (gitignored)
├── .env.example              # Environment variables template
├── .gitignore               # Git ignore rules
└── manage.py                 # Django management script
```

## 🔧 Configuration

### Environment Variables

All sensitive configuration is stored in `.env`. Never commit this file to version control.

- `DB_NAME`: MySQL database name
- `DB_USER`: MySQL username
- `DB_PASSWORD`: MySQL password
- `DB_HOST`: MySQL host (default: localhost)
- `DB_PORT`: MySQL port (default: 3306)
- `SECRET_KEY`: Django secret key (generate a new one for production)
- `DEBUG`: Debug mode (True/False)
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts

### Installed Packages

- **Django 4.2+**: Web framework
- **djangorestframework**: REST API framework
- **django-cors-headers**: CORS headers middleware
- **mysqlclient**: MySQL database adapter
- **python-dotenv**: Environment variables management

### CORS Configuration

**⚠️ Development Mode**: CORS is configured to allow all origins (`CORS_ALLOW_ALL_ORIGINS = True`)

**🚨 Production**: Update `settings.py` to use `CORS_ALLOWED_ORIGINS` with specific domains:

```python
CORS_ALLOW_ALL_ORIGINS = False  # Disable in production
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.com",
]
```

## 🛠️ Development Commands

```powershell
# Activate virtual environment
.\venv\Scripts\activate

# Install/update dependencies
pip install -r requirements.txt

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Run development server
python manage.py runserver

# Create admin user
python manage.py createsuperuser

# Run tests
python manage.py test

# Collect static files (for production)
python manage.py collectstatic
```

## 📦 Next Steps

1. **Define Models**: Add your database models in `core/models.py`
2. **Create API Views**: Build REST API endpoints in `core/views.py`
3. **Configure URLs**: Set up URL routing in `core/urls.py` and include in `saned/urls.py`
4. **Add Authentication**: Implement JWT or token-based authentication
5. **Write Tests**: Add unit tests in `core/tests.py`

## 🔒 Security Notes

- Secret key should be changed for production
- Debug mode must be False in production
- Configure specific CORS origins for production
- Use environment variables for all sensitive data
- All credentials are in `.env` (gitignored)

## 📝 License

This project is part of the Saned platform.
