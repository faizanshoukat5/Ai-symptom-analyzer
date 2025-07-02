# Updating the Frontend Configuration

After deploying your backend to Render, follow these steps to connect your Firebase-hosted frontend to the new backend.

## Step 1: Update Environment Variables

Create or modify the `.env.production` file in your project root with the following:

```
VITE_API_BASE_URL=https://your-render-service-name.onrender.com
```

Replace `your-render-service-name` with the actual name of your Render service (you'll get this URL after deploying to Render).

## Step 2: Rebuild and Deploy the Frontend

```bash
# Build the production version with updated environment variables
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

## Step 3: Test the Live Site

Visit your Firebase hosted website (https://ai-symptom-analyzer.web.app) and verify that:

1. The application loads correctly
2. You can submit symptoms for analysis
3. The backend responds with analysis results

## Troubleshooting

If you encounter any issues:

### CORS Errors

If you see CORS errors in the browser console, make sure:
- Your Firebase URL is added to the `allow_origins` list in `main_simplified.py`
- You've redeployed your backend after making this change

### API Connection Issues

If the frontend can't connect to the backend:
- Verify that the Render service is running
- Check that the URL in `.env.production` is correct
- Note that on the free tier, the first request after inactivity might take 30-60 seconds

### Other Frontend Issues

- Clear your browser cache
- Try in an incognito/private window
- Check the browser console for specific error messages
