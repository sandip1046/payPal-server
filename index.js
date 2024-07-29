require('dotenv').config();
const express = require('express');
const paypal = require('paypal-rest-sdk');
const cors = require('cors');


const app = express();
const router = express.Router();

app.use(express.json());

// CORS configuration
const corsOptions = {
    origin: 'https://sandip-ed-tech.vercel.app',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Pre-flight requests

// Custom middleware for setting headers
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://sandip-ed-tech.vercel.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

// PayPal configuration
paypal.configure({
    'mode': 'sandbox', //sandbox
    'client_id': process.env.PAYPAL_CLIENT_ID,
    'client_secret': process.env.PAYPAL_CLIENT_SECRET
});

// Defining routes


app.get('/payment', async (req, res) => {


    let data
    try {

        let create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "https://pay-pal-server.vercel.app/",
                "cancel_url": "https://pay-pal-server.vercel.app/failed"
            },
            "transactions": [{
                // "item_list": {
                //     "items": [{
                //         "name": "item",
                //         "sku": "item",
                //         "price": "30",
                //         "currency": "USD",
                //         "quantity": 1
                //     }]
                // },
                "amount": {
                    "currency": "USD",
                    "total": "30"
                },
                "description": "Complete the payment to get access for course."
            }]
        };


        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                console.error("error");
                return res.status(500).json({ message: "Payment failed" });

            } else {
                for (let i = 0; i < payment.links.length; i++) {
                    if (payment.links[i].rel === 'approval_url') {
                        res.redirect(payment.links[i].href);
                    }
                }

            }
        });


    } catch (error) {
        console.log(error);
    }
})
app.post('/paymentCoupon', async (req, res) => {
    const { price } = req.body; //EXTRACTING PRICE FROM THE BODY OF THE REQUEST INORDER GET THE PRICE OF THE COURSE AFTER APPLYING THE COUPON

    //IF INVALID PRICE IS GIVEN BY THE USER
    if (!price || isNaN(price)) {
        return res.status(400).json({ message: "Invalid price" });
    }

    let data
    try {

        let create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "https://pay-pal-server.vercel.app/",
                "cancel_url": "https://pay-pal-server.vercel.app/failed"
            },
            "transactions": [{
                // "item_list": {
                //     "items": [{
                //         "name": "item",
                //         "sku": "item",
                //         "price": price.toFixed(2),
                //         "currency": "USD",
                //         "quantity": 1
                //     }]
                // },
                "amount": {
                    "currency": "USD",
                    "total": price.toFixed(2)
                },
                "description": "Complete the payment to get access for course."
            }]
        };


         paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                console.error("error");
                return res.status(500).json({ message: "Payment failed" });

            } else {
                for (let i = 0; i < payment.links.length; i++) {
                    if (payment.links[i].rel === 'approval_url') {
                        res.redirect(payment.links[i].href);
                    }
                }

            }
        });


    } catch (error) {
        console.log("Try Block error",error);
    }
})



app.get('/', async (req, res) => {

    try {
       const PayerID = req.query.PayerID;
       const paymentId = req.query.paymentId;

        if (!PayerID || !paymentId) {
            // Check if query params are missing
            alert("Missing query parameters", { PayerID, paymentId });
            return res.status(400).json({ success: false, message: "Missing query parameters" });
        }

        const execute_payment_json = {
            "payer_id": PayerID,
            "transactions": [{
                "amount": {
                    "currency": "USD",
                    "total": "1.00"
                }
            }]
        }


         paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
            if (error) {
                console.error("Error at executing payment",error);
                return res.status(500).json({ success: false, message: "Payment failed because of payment execute" }); //this will send success: false to the FE.

            } else {
                console.log("Execute Payment Response:", payment);
                return res.status(200).json({ success: true, message: "Payment successful!" });
                // console.log("Execute Payment Response:", payment);
                // // console.log(payment);
                // const response = JSON.stringify(payment);
                // const parsedResponse = JSON.parse(response);

                // const transactions = parsedResponse.transactions[0];

                // console.log("transactions", transactions);

                // console.error("Payment Successfull!")

                // return res.status(200).json({ success: true, message: "Payment successful!" });//this will send response to the FE that payment succeed.

            }
        })


    } catch (error) {
        console.log("Error in succes endpoint",error);
        return res.status(500).json({ message: "Payment failed and  Failed at try catch of /success" });
    }

})


app.get('/failed', async (req, res) => {

    return res.status(500).json({ message: "Payment failed and now redirected to failed endpoint" });

})

// // Start the server
app.listen(8000, () => {

    console.log('Server is running on port 8000');
});

