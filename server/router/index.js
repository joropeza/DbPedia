/**
 * The Index of Routes
 */

module.exports = function (app) {

    // The signup route
    app.use('/query', require('./routes/query'));
    app.use('/resources', require('./routes/resources'));
}