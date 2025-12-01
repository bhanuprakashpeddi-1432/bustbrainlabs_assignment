# Deployment Guide

## Backend Deployment (Render/Railway)

### Option 1: Deploy to Render

1. **Create account** at [render.com](https://render.com)

2. **Create new Web Service**
   - Connect your GitHub repository
   - Select the `backend` directory
   - Configure:
     - **Name**: `airtable-form-backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

3. **Add Environment Variables**
   ```
   DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/airtable_forms
   AIRTABLE_CLIENT_ID=your_client_id
   AIRTABLE_CLIENT_SECRET=your_client_secret
   AIRTABLE_REDIRECT_URI=https://your-app.onrender.com/auth/airtable/callback
   WEBHOOK_SECRET=your_webhook_secret
   PORT=3000
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your app URL: `https://your-app.onrender.com`

### Option 2: Deploy to Railway

1. **Create account** at [railway.app](https://railway.app)

2. **Create new project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure**
   - Set root directory to `backend`
   - Railway will auto-detect Node.js

4. **Add Environment Variables**
   - Go to Variables tab
   - Add all environment variables (same as above)

5. **Deploy**
   - Railway will automatically deploy
   - Get your app URL from the Deployments tab

### MongoDB Atlas Setup

1. **Create account** at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

2. **Create cluster**
   - Choose free tier (M0)
   - Select region closest to your backend

3. **Create database user**
   - Database Access → Add New Database User
   - Set username and password
   - Grant read/write permissions

4. **Whitelist IP**
   - Network Access → Add IP Address
   - Allow access from anywhere: `0.0.0.0/0`
   - (Or restrict to your backend's IP)

5. **Get connection string**
   - Clusters → Connect → Connect your application
   - Copy connection string
   - Replace `<password>` with your database user password
   - Add to `DATABASE_URL` environment variable

### Update Airtable OAuth

1. Go to [Airtable Developer Hub](https://airtable.com/create/oauth)
2. Edit your OAuth integration
3. Update redirect URI to production URL:
   ```
   https://your-app.onrender.com/auth/airtable/callback
   ```
4. Save changes

### Configure Airtable Webhooks

1. **Create webhook** via Airtable API or UI
2. **Set webhook URL**:
   ```
   https://your-app.onrender.com/webhooks/airtable
   ```
3. **Add webhook secret** to environment variables
4. **Test webhook**:
   ```bash
   curl https://your-app.onrender.com/webhooks/airtable/test
   ```

---

## Frontend Deployment (Vercel/Netlify)

### Option 1: Deploy to Vercel

1. **Create account** at [vercel.com](https://vercel.com)

2. **Import project**
   - Click "New Project"
   - Import from GitHub
   - Select your repository

3. **Configure**
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Add Environment Variables**
   ```
   VITE_API_BASE_URL=https://your-backend.onrender.com
   ```

5. **Deploy**
   - Click "Deploy"
   - Get your app URL: `https://your-app.vercel.app`

### Option 2: Deploy to Netlify

1. **Create account** at [netlify.com](https://netlify.com)

2. **Create new site**
   - Sites → Add new site → Import from Git
   - Connect to GitHub
   - Select repository

3. **Configure**
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

4. **Add Environment Variables**
   - Site settings → Environment variables
   - Add `VITE_API_BASE_URL`

5. **Deploy**
   - Netlify will automatically deploy
   - Get your app URL: `https://your-app.netlify.app`

---

## Post-Deployment Checklist

### Backend
- [ ] MongoDB connection working
- [ ] OAuth flow works with production URL
- [ ] All API endpoints responding
- [ ] Webhook endpoint accessible
- [ ] Environment variables set correctly
- [ ] Logs showing no errors

### Frontend
- [ ] App loads successfully
- [ ] API calls working
- [ ] OAuth redirect working
- [ ] Forms can be created
- [ ] Forms can be submitted
- [ ] Responses displayed correctly

### Airtable Configuration
- [ ] OAuth redirect URI updated
- [ ] Webhook URL configured
- [ ] Webhook secret set
- [ ] Test webhook working

---

## Testing Production Deployment

### 1. Test OAuth Flow
```bash
# Open in browser
https://your-frontend.vercel.app/login

# Should redirect to Airtable
# After authorization, should redirect back with user data
```

### 2. Test API Endpoints
```bash
# Test webhook
curl https://your-backend.onrender.com/webhooks/airtable/test

# Test form creation (with user ID from OAuth)
curl -X POST https://your-backend.onrender.com/forms \
  -H "Content-Type: application/json" \
  -H "x-user-id: YOUR_USER_ID" \
  -d '{
    "airtableBaseId": "appXXX",
    "airtableTableId": "tblYYY",
    "title": "Test Form",
    "questions": []
  }'
```

### 3. Test Form Submission
```bash
# Submit a form response
curl -X POST https://your-backend.onrender.com/responses/FORM_ID/submit \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {
      "name": "Test User"
    }
  }'

# Check Airtable to verify record was created
```

---

## Monitoring & Maintenance

### Logs
- **Render**: Dashboard → Logs tab
- **Railway**: Project → Deployments → View Logs
- **Vercel**: Project → Deployments → Function Logs
- **Netlify**: Site → Deploys → Deploy log

### Database Monitoring
- **MongoDB Atlas**: Clusters → Metrics
- Monitor connections, operations, storage

### Error Tracking (Optional)
1. **Set up Sentry**
   ```bash
   npm install @sentry/node
   ```

2. **Configure in app.js**
   ```javascript
   const Sentry = require('@sentry/node');
   Sentry.init({ dsn: process.env.SENTRY_DSN });
   ```

3. **Add to environment variables**

---

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
- Check connection string format
- Verify database user credentials
- Ensure IP whitelist includes `0.0.0.0/0`
- Check network access settings

#### 2. OAuth Redirect Not Working
- Verify redirect URI matches exactly in Airtable settings
- Check for trailing slashes
- Ensure HTTPS in production

#### 3. Webhook Not Receiving Events
- Verify webhook URL is publicly accessible
- Check webhook secret matches
- Test with curl first
- Check Airtable webhook configuration

#### 4. CORS Errors
- Add CORS middleware to backend:
  ```javascript
  const cors = require('cors');
  app.use(cors({
    origin: process.env.FRONTEND_URL
  }));
  ```

#### 5. Environment Variables Not Loading
- Verify variable names match exactly
- Restart service after adding variables
- Check for typos in variable names

---

## Performance Optimization

### Backend
1. **Add caching** for base schemas
2. **Implement rate limiting**
3. **Optimize database queries** with indexes
4. **Enable compression**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

### Frontend
1. **Code splitting** with React lazy loading
2. **Image optimization**
3. **Bundle size optimization**
4. **CDN for static assets**

---

## Security Checklist

- [ ] Environment variables not exposed
- [ ] HTTPS enabled (automatic on Vercel/Netlify/Render)
- [ ] Webhook signature verification enabled
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] CORS properly configured
- [ ] Tokens encrypted at rest (optional)
- [ ] SQL injection prevention (using Mongoose)
- [ ] XSS prevention (React handles this)

---

## Scaling Considerations

### When to Scale
- Response time > 1 second
- Error rate > 1%
- Database connections maxed out
- Memory usage > 80%

### How to Scale
1. **Upgrade hosting plan** (more CPU/RAM)
2. **Add database replicas** (MongoDB Atlas)
3. **Implement caching** (Redis)
4. **Use CDN** for static assets
5. **Optimize queries** and indexes

---

## Backup & Recovery

### Database Backups
- **MongoDB Atlas**: Automatic backups enabled by default
- **Manual backup**: Use `mongodump`
  ```bash
  mongodump --uri="mongodb+srv://..." --out=./backup
  ```

### Code Backups
- GitHub repository (version controlled)
- Regular commits and tags

---

## Cost Estimates

### Free Tier Options
- **MongoDB Atlas**: Free M0 cluster (512 MB)
- **Render**: Free tier (750 hours/month)
- **Railway**: $5 credit/month
- **Vercel**: Free for personal projects
- **Netlify**: Free for personal projects

### Paid Tiers (if needed)
- **MongoDB Atlas**: $9/month (M10 cluster)
- **Render**: $7/month (starter plan)
- **Railway**: Pay as you go (~$5-10/month)

**Total estimated cost**: $0-20/month depending on usage

---

## Support & Resources

- **Render Docs**: https://render.com/docs
- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Airtable API Docs**: https://airtable.com/developers/web/api

---

**Good luck with your deployment! 🚀**
