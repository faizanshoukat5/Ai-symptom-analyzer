# Deploying to Render

This guide provides step-by-step instructions for deploying the AI Symptom Checker backend to Render.com's free tier.

## Step 1: Sign up for Render

1. Go to [Render.com](https://render.com/) and sign up for a free account
2. You can use your GitHub account or email to sign up

## Step 2: Create a new Web Service

1. From your Render dashboard, click on "New" and select "Web Service"
2. Connect your GitHub repository or use the "Public Git repository" option
   - If deploying from GitHub, select your repository
   - If using direct deployment, enter: `https://github.com/yourusername/symptom-checker.git`
3. Give your service a name (e.g., "ai-symptom-checker-backend")
4. Ensure the root directory is set to `/backend`
5. Choose "Python" as the runtime
6. Set the build command: `pip install -r requirements.txt`
7. Set the start command: `gunicorn main_simplified:app --bind 0.0.0.0:$PORT --worker-class uvicorn.workers.UvicornWorker`
8. Choose the Free plan
9. Click "Create Web Service"

## Step 3: Set Environment Variables

After the service is created, go to the "Environment" tab and add these variables:

- `OPENAI_API_KEY`: Your OpenAI API key
- `PYTHON_VERSION`: 3.9.0

## Step 4: Update the Frontend

Once your backend is deployed, you'll need to update your frontend to point to the new backend URL:

1. In your React app, update the API base URL in `.env.production`:
   ```
   VITE_API_BASE_URL=https://your-render-service-name.onrender.com
   ```

2. Redeploy your frontend to Firebase:
   ```
   npm run build
   firebase deploy --only hosting
   ```

## Troubleshooting

- If the deployment fails, check the logs in the Render dashboard
- Make sure all required packages are in `requirements.txt`
- If you see CORS errors, verify that your Firebase URL is in the `allow_origins` list in `main_simplified.py`

## Maintenance

The free tier of Render has the following limitations:
- Services spin down after 15 minutes of inactivity
- Limited to 750 hours of runtime per month
- When a service spins up after inactivity, it may take 30-60 seconds to respond to the first request

For a more responsive service, consider upgrading to a paid plan or exploring other hosting options.
