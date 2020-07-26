const express = require('express')
const app = express()
const port = 3000
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.route('/')
//    .get((req, res) => res.send('Hello World!'));
      .get((req, res) => res.sendFile(path.join(__dirname, 'views/index.html')));
    
    
app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!")
})


app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
