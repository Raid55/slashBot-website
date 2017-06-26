const app = require('./app');

//Setting the port
const PORT = process.env.PORT || 5555;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
