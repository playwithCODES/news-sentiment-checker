# News Sentiment Checker

This is a full-stack web application that I built as a college project. The main goal of this project is to analyze news content and determine whether it is **positive, negative, or neutral**.

Instead of reading long news articles and guessing the tone, this system helps users quickly understand the sentiment using basic NLP (Natural Language Processing).

---

## What this project does

* Users can register and login
* Users can enter news manually or provide a URL
* The system analyzes the news content
* It shows:

  * sentiment (positive / negative / neutral)
  * score and confidence
  * keywords found
* All results are saved and can be viewed later
* Dashboard shows charts and summary
* Data can be exported as CSV or PDF

---

## Technologies used

### Frontend

* Next.js
* Tailwind CSS
* Axios
* Recharts

### Backend

* Node.js
* Express.js (CommonJS)
* MongoDB + Mongoose
* JWT authentication
* sentiment npm package



## Project structure


news-sentiment-checker/
  backend/
  frontend/


Backend handles API and database.
Frontend handles UI and user interaction.


## How to use

1. Open browser → `http://localhost:3000`
2. Register account
3. Login
4. Go to dashboard
5. Enter news headline and content (or URL)
6. Click analyze
7. View result


## Example

Positive:The team performed very well and achieved great success.


Negative:The market suffered a heavy loss and showed poor performance.




## Problems faced

* MongoDB connection errors in the beginning
* Understanding how backend and frontend connect
* Handling token authentication
* Some websites block scraping (URL feature not always reliable)



## Limitations

* Uses simple sentiment logic (not advanced AI)
* URL scraping does not work for all websites
* No real-time news API



## What I learned

* How frontend and backend work together
* REST API basics
* Authentication using JWT
* Working with MongoDB
* Basic NLP concept



## Future improvements

* Use better AI model for sentiment analysis
* Add real news API
* Improve UI
* Add pagination and filters
* File upload support




