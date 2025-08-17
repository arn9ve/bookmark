# Bookmark Analyzer

This is a Next.js application that allows you to analyze a web page. It scrapes the content, analyzes it, and displays information about the page's classification, location, and more.

## Technologies Used

- [Next.js](https://nextjs.org) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com)

## Project Structure

- `src/app/`: Contains the main application pages and components.
- `src/lib/scraping/`: Contains the core logic for scraping and analyzing web pages.
- `public/`: Static assets.

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/arn9ve/bookmark.git
    cd bookmark
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add the following variable. This is required for the map feature to work.

    ```env
    NEXT_PUBLIC_GOOGLE_MAPS_KEY=<your-google-maps-api-key>
    GOOGLE_MAPS_KEY=<your-google-maps-api-key>
    OPENAI_API_KEY=<your-openai-api-key>
    DEEPSEEK_API_KEY=<your-deepseek-api-key>
    APIFY_API_TOKEN=<your-apify-api-token>
    ```
    You will need to get API keys from Google Cloud Console, OpenAI, DeepSeek, and Apify.

4.  **Run the development server:**
    ```
    npm run dev