const express = require( "express" );
const router = express.Router();

const Product = require( "../models/product" );

const mongoose = require( "mongoose" );
const multer = require( "multer" );

const checkAuth = require( "../middleware/check-auth" )


const storage = multer.diskStorage( {
    destination: function ( req, file, cb )
    {
        console.log( "destination", file );
        cb( null, "./uploads" );
    },
    filename: function ( req, file, cb )
    {
        cb( null, file.originalname );
    },
} );


const upload = multer( {
    storage: storage, limits: {
        fileSize: 1024 * 1024 * 5
    }
} );

router.get( "/", ( req, res, next ) =>
{
    Product.find()
        .select( "name price _id" )
        .exec()
        .then( ( docs ) =>
        {
            const response = {
                count: docs.length,
                products: docs.map( ( doc ) =>
                {
                    return {
                        name: doc.name,
                        price: doc.price,
                        _id: doc._id,
                        request: {
                            type: "GET",
                            url: "http://localhost:3000/products/" + doc._id,
                        },
                    };
                } ),
            };
            // if ( doc.length >= 0 )
            // {
            res.status( 200 ).json( response );
            // } else
            // {
            //     res.status( 404 ).json( {
            //         message: "no enters are found"
            //     } )
            // }
        } )
        .catch( ( err ) =>
        {
            console.log( err );
            res.status( 500 ).json( {
                error: err,
            } );
        } );
} );

router.post( "/", checkAuth, upload.single( "productImage" ), ( req, res, next ) =>
{
    console.log( "fileres", res.file );
    const product = new Product( {
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
    } );

    product
        .save()
        .then( ( result ) =>
        {
            res.status( 201 ).json( {
                message: "Create product successfully",
                createdProduct: {
                    name: result.name,
                    price: result.price,
                    _id: result._id,
                    request: {
                        type: "GET",
                        url: "http://localhost:3000/products/" + result._id,
                    },
                },
            } );
            console.log( result );
        } )
        .catch( ( err ) =>
        {
            console.log( err );
            res.status( 500 ).json( {
                error: err,
            } );
        } );
} );

router.get( "/:productId", checkAuth, ( req, res, next ) =>
{
    const id = req.params.productId;
    Product.findById( id )
        .select( "name price _id" )
        .exec()
        .then( ( doc ) =>
        {
            console.log( "form data base", doc );
            if ( doc )
            {
                res.status( 200 ).json( {
                    products: doc,
                    request: {
                        type: "GET",
                        url: "http://localhost:3000/products",
                    },
                } );
            } else
            {
                res.status( 404 ).json( { message: "invalid product id" } );
            }
        } )
        .catch( ( err ) =>
        {
            console.log( err );
            res.status( 500 ).json( { error: err } );
        } );
} );

router.patch( "/:productId", checkAuth, ( req, res, next ) =>
{
    const id = req.params.productId;

    // const updateOps = {}
    // for ( const ops of Object.keys( req.body ) )
    // {
    //     updateOps[ ops.propName ] = ops.value
    // }
    console.log( "updateOps", req.body );
    Product.updateMany(
        { _id: id },
        {
            $set: {
                ...req.body,
            },
        }
    )
        .exec()
        .then( ( results ) =>
        {
            console.log( results );
            res.status( 200 ).json( {
                message: "Product updated",
                request: {
                    type: "GET",
                    url: "http://localhost:3000/products/" + id,
                },
            } );
        } )
        .catch( ( err ) =>
        {
            res.status( 500 ).json( {
                error: err,
            } );
        } );
} );

router.delete( "/:productId", checkAuth, ( req, res, next ) =>
{
    const id = req.params.productId;

    Product.deleteOne( { _id: id } )
        .exec()
        .then( ( result ) =>
        {
            console.log( result );
            res.status( 200 ).json( {
                message: "product deleted",
                url: "http://localhost:3000/products",
                body: { name: "string", price: "number" },
            } );
        } )
        .catch( ( err ) =>
        {
            console.log( "error", err );
            res.status( 500 ).json( { error: err } );
        } );
} );

module.exports = router;
