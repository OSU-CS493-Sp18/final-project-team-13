const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const morgan = require('morgan');
const api = require('./api');

app.use(morgan('dev'));


app.use('/', api);

app.use('*', function(req, res, next){
    res.status(404).json({
        error: "Requested resource " + req.originalUrl + " does not exist"
    });
})

app.listen(port, () => console.log(`Server listening on port ${port}`));