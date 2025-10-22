# Security Guidelines

## ⚠️ Important Security Notice

### Hardcoded Credentials
The `config.json` file currently contains hardcoded SAP Service Layer credentials. This is **NOT** recommended for production use.

### Recommended Actions

1. **Remove Credentials from config.json**
   - Remove `DefaultUser` and `DefaultPassword` from config.json
   - Never commit sensitive credentials to version control

2. **Use Environment Variables**
   Create a `.env` file (add to .gitignore):
   ```
   SAP_DEFAULT_USER=your_username
   SAP_DEFAULT_PASSWORD=your_password
   ```

3. **Update Flask Backend**
   Modify `backend/config.py` to read from environment variables:
   ```python
   import os
   from dotenv import load_dotenv
   
   load_dotenv()
   
   @property
   def default_user(self):
       return os.getenv('SAP_DEFAULT_USER', '')
   
   @property
   def default_password(self):
       return os.getenv('SAP_DEFAULT_PASSWORD', '')
   ```

4. **Use Replit Secrets**
   If deploying on Replit:
   - Use the Secrets tab in Replit
   - Add `SAP_DEFAULT_USER` and `SAP_DEFAULT_PASSWORD`
   - Access via `os.environ['SAP_DEFAULT_USER']`

## API Security

The application uses Bearer token authentication:
- Tokens are returned after successful login
- Tokens must be sent in Authorization header: `Bearer <token>`
- Tokens expire based on SAP B1 session timeout (default 30 minutes)

## Additional Security Recommendations

1. **HTTPS Only**: Always use HTTPS in production
2. **Session Timeout**: Monitor and enforce session timeouts
3. **Input Validation**: All user inputs are validated
4. **CORS Configuration**: Review CORS settings for production
5. **Environment Variables**: Never hardcode sensitive data
