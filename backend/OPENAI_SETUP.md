# 🔑 OpenAI API Key Setup Instructions

## Step 1: Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/account/api-keys)
2. Sign in to your OpenAI account (or create one if needed)
3. Click "Create new secret key"
4. Copy the generated API key (starts with `sk-`)

## Step 2: Add API Key to Environment

1. Navigate to the `backend` folder
2. Open the `.env` file in a text editor
3. Replace `your_openai_api_key_here` with your actual API key:

```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

4. Save the file

## Step 3: Restart the Server

After adding your API key:
1. Stop the current server (Ctrl+C in the terminal)
2. Restart it: `python start_server.py`

## ⚠️ Important Security Notes

- **Never commit your API key to version control**
- The `.env` file should be in your `.gitignore`
- Keep your API key secure and don't share it
- Monitor your OpenAI usage to control costs

## 💰 Cost Information

- This app uses `gpt-4o-mini` which is cost-effective
- Typical analysis costs ~$0.001-0.01 per request
- Monitor usage at [OpenAI Usage Dashboard](https://platform.openai.com/usage)

## 🧪 Testing the API

Once your API key is set:
1. The server should start without warnings
2. Visit http://localhost:8000/docs to see the API documentation
3. Test the `/analyze-symptoms` endpoint
4. Run `python test_api.py` to verify everything works

## 🆘 Troubleshooting

If you see "OPENAI_API_KEY not found":
- Check that the `.env` file exists in the `backend` folder
- Ensure the API key line doesn't have extra spaces
- Restart the server after making changes

If you get authentication errors:
- Verify your API key is correct
- Check that your OpenAI account has credits/billing set up
- Ensure the API key hasn't expired
