const express = require('express');
const paypal = require('paypal-rest-sdk');
const cors = require('cors');


const app = express();
const router = express.Router();
app.use(express.json());

app.use(cors());

// PayPal configuration
paypal.configure({
    'mode': 'sandbox', //sandbox
    'client_id': 'ARk3rK-7NlfgiS8zJrNPAe4lvQgfczBDYujOPwLY1f9qGNRIPUmBBQBICZ8R_c4nXaBvTi059vBvfnZj',
    'client_secret': 'EBMGdaVshNZvfateqvnpMMf3TOPHOwCVSQ3-IbN7kvq75tA8jV1hX-ziWOd6gdHeoS2j72iIS_JPALNh'
});

// Defining routes


router.get('/payment', async (req, res) => {


    let data
    try {

        let create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "https://edtech-sandip.netlify.app/success",
                "cancel_url": "https://edtech-sandip.netlify.app"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "item",
                        "sku": "item",
                        "price":"30",
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "USD",
                    "total": "30"
                },
                "description": "Complete the payment to get access for course."
            }]
        };


        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                alert("error");
                return res.status(500).json({ message: "Payment failed" });

            } else {
                console.log("Create Payment Response");
                // console.log(payment);
                data = payment;
                res.json(data);

            }
        });


    } catch (error) {
        console.log(error);
    }
})
router.post('/paymentCoupon', async (req, res) => {
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
                "return_url": "https://edtech-sandip.netlify.app/success",
                "cancel_url": "https://edtech-sandip.netlify.app"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "item",
                        "sku": "item",
                        "price":price.toFixed(2),
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "USD",
                    "total": price.toFixed(2)
                },
                "description": "Complete the payment to get access for course."
            }]
        };


        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                alert("error");
                return res.status(500).json({ message: "Payment failed" });

            } else {
                console.log("Create Payment Response");
                // console.log(payment);
                data = payment;
                res.json(data);

            }
        });


    } catch (error) {
        console.log(error);
    }
})



router.get('/success', async (req, res) => {

    try {

        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId;

        const execute_payment_json = {
            "payer_id": payerId,
            "transactions": [{
                "amount": {
                    "currency": "USD",
                    "total": "1.00"
                }
            }]
        }


        paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
            if (error) {
                alert(error);
                return res.status(500).json({ success: false, message: "Payment failed" }); //this will send success: false to the FE.

            } else {
                console.log("Execute Payment Response");
                // console.log(payment);
                const response = JSON.stringify(payment);
                const parsedResponse = JSON.parse(response);

                const transactions = parsedResponse.transactions[0];

                console.log("transactions", transactions);

                alert("Payment Successfull!")

                return res.status(200).json({ success: true, message: "Payment successful!" });//this will send response to the FE that payment succeed.

            }
        })


    } catch (error) {
        console.log(error);
    }

})


router.get('/failed', async (req, res) => {

    return res.status(500).json({ message: "Payment failed" });

})

// // Start the server
app.listen(8000, () => {

    console.log('Server is running on port 8000');
});

