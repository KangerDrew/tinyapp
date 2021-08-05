# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["Main Page"](./images/login.gf)

!["List of Abbreviated Links "](#)

!["Shortening New Link"](#)

!["Editing Existing Link"](#)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

1. Install all dependencies (using the `npm install` command).
2. Run the development web server using the `node express_server.js` command.
3. Open up the browser of your preference, and paste in http://localhost:8080/ to begin.
    - It should automatically open up the [main page](http://localhost:8080/urls)
4. Navigate towards registration page, located at the top right corner.
    - Must be a valid email.
    - Cannot use the same email twice to register.
    - Once registered, you will automatically login using the newly registered account.
5. You can begin by creating a new short link. Click on "Create New URL" on top left corner.
6. Enter a long URL you want to truncate, and hit the submit button.
7. You will be re-directed to the page where you can edit the long URL for something else. Only you can make this change!
8. Finally, to share/use your shortened URL, simply enter in your link like this: http://localhost:8080/u/YOUR_SHORTENED_URL
