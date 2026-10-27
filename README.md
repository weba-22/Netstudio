# Netstudio
movie website and app

## Admin and owner setup

Set these variables in the local `.env` file or deployment environment before starting the server:

```env
ADMIN_PASSWORD=<unique password with at least 12 characters>
OWNER_PASSWORD=<different unique password with at least 12 characters>
OWNER_TWO_FACTOR_PIN=<six-digit PIN>
SESSION_SECRET=<random secret with at least 32 characters>
```

Do not commit `.env` or share these values in chat. The admin portal is available at `/admin1-weba2`; the owner treasury is at `/weba-token-wallet`. Both routes show their login gate and still require valid credentials.
