const express = require( "express" );

const app = express();
const morgan = require( "morgan" );
const bodyParser = require( "body-parser" );
const mongoose = require( "mongoose" );

const productRoutes = require( "./api/route/products" );

const ordersRoutes = require( "./api/route/orders" );
const userRoutes = require( "./api/route/user" )

require( 'dotenv' ).config();

mongoose.connect(
    process.env.MONGODB_URI,
    {
        useNewUrlParser: true,
    }
);

console.log( "app.js" );

app.use( morgan( "dev" ) );
app.use( bodyParser.urlencoded( { extended: false } ) );
app.use( bodyParser.json() );

app.use( ( req, res, next ) =>
{
    res.header( "Accers-control-allow-origin", "*" );
    res.header(
        "access-Control-allow-Headers",
        "Origin,X-Requessted-with, Content-type, Accept, Authorization"
    );
    if ( req.method === "OPTIONS" )
    {
        res.header( "Access-Control-Allow-Methods", "PUT,POST,PATCH,DELETE,GET" );
        return res.status( 200 ).json( {} );
    }
    next();
} );

// routes which should handle requests
app.use( "/products", productRoutes );
app.use( "/orders", ordersRoutes );
app.use( "/user", userRoutes );

app.use( ( req, res, next ) =>
{
    const error = new Error( "Not found" );
    error.status = 404;
    next( error );
} );

app.use( ( error, req, res, next ) =>
{
    res.status( error.status || 500 );
    res.json( {
        error: {
            message: error.message,
        },
    } );
} );

module.exports = app;
