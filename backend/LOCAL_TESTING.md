# Testing the Backend Locally

Before deploying to Render, it's a good idea to test your backend locally to ensure everything works as expected.

## Step 1: Set up Environment Variables

Create or update your `.env` file in the `/backend` directory with the following variables:

```
OPENAI_API_KEY=your_openai_api_key
```

## Step 2: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

## Step 3: Run the Server

```bash
uvicorn main_simplified:app --reload
```

Your API should now be running at [http://localhost:8000](http://localhost:8000)

## Step 4: Test the API

Open your browser and navigate to [http://localhost:8000/docs](http://localhost:8000/docs) to see the auto-generated Swagger UI documentation.

You can test the API endpoints directly from there.

## Step 5: Test with the Frontend

1. In your frontend directory, make sure your `.env.development` file points to your local server:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```

2. Start your React development server:
   ```bash
   npm run dev
   ```

3. Navigate to your frontend in the browser (typically at [http://localhost:5173](http://localhost:5173)) and test the full application flow.
