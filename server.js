const dotenv = require('dotenv');
const mongoose = require('mongoose');

/**
 * UNCAUGHT EXCEPTION HANDLER
 */
// process.on('uncaughtException', (err) => {
//   console.log(err.name, err.message);
//   console.log('Uncaught Exception ! Shutting down');
//   process.exit(1); // Shutdown the process
// });

// Read env variables from config.env file and save them into node env variables
dotenv.config({ path: './config.env' });

// Insert password into DB connection URI
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

/**
 * Connect to DB
 */
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('Connected to DB');
  })
  .catch((err) => console.log(err));

/**
 * START SERVER
 */
const port = process.env.PORT || 3000;

// Import application
const app = require('./app');

// Start Server
const server = app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

/**
 * UNHANDLED REJECTION HANDLER
 */
// process.on('unhandledRejection', (err) => {
//   console.log(err.name, err.message);
//   console.log('Unhandled Rejection ! Shutting down');

//   // Close the server first (handle last request/response)
//   server.close(() => {
//     process.exit(1); // Shutdown the process
//   });
// });
