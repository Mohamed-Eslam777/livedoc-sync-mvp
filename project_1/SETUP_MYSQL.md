# IMPORTANT: Update Your MySQL Credentials

The `.env` file currently has placeholder values. You MUST update it with your actual MySQL credentials.

## Quick Fix

Open the `.env` file and update these lines with your actual MySQL credentials:

```env
DB_USER=root              # Replace with your MySQL username
DB_PASSWORD=your_password # Replace with your MySQL password
```

## Example

If your MySQL username is `root` and password is `mypassword123`, update `.env` to:

```env
DB_NAME=saned_db
DB_USER=root
DB_PASSWORD=mypassword123
DB_HOST=localhost
DB_PORT=3306
```

After updating, run migrations again:

```powershell
python manage.py migrate
```
