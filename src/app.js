// excess package/models for use
require("dotenv").config();
const express = require("express");
const path = require("path");
const hbs = require("hbs");
hbs.handlebars === require('handlebars');
const bcrypt = require("bcryptjs");
const jwt = require("JsonWebToken");
const nodemailer = require('nodemailer');
const cookieParser = require("cookie-parser");

// excess conn file to connect the database
require("./db/conn.js");

// access auth file for authentication 
const auth = require("./middleware/auth");

// import models for database
const Register = require("./models/register"); // collection users of database
const userBands = require("./models/userbands"); // collection userbands of database

const app = express();
const port = process.env.PORT || 8000;

// setting the path 
const staticpath = path.join(__dirname, "../public"); //path for static website
const templatepath = path.join(__dirname, "../template/views");
const particalpath = path.join(__dirname, "../template/partical");

// middleware
app.use('/css', express.static(path.join(__dirname, "../node_modules/bootstrap/dist/css")));
app.use('/js', express.static(path.join(__dirname, "../node_modules/bootstrap/dist/js")));
app.use('/jq', express.static(path.join(__dirname, "../node_modules/jquery/dist")));
app.use('/publicfolder', express.static(path.join(__dirname, "../public")));

// for get input fields
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// set views
app.set("view engine", "hbs");
app.set("views", templatepath);
hbs.registerPartials(particalpath);

app.use(express.static(staticpath)); // for static website

// Routing 
// app.get(path, calback)
app.get('/', (req, res) => {
    // old => res.send("Hello sir Server is on how may help you");    
    res.render("index");
})

app.get('/contact', (req, res) => {
    res.render("contact");
})
app.get('/register', (req, res) => {
    res.render("register");
})
app.get('/resetpassword', (req, res) => {
    res.render("resetpassword");
})
app.get('/dashboard', async (req, res) => {
    const getallbands = await userBands.find();
    email = req.cookies.email; // find login user with the help of cookie
    const user_profil = await Register.findOne({ email: email });

    res.render("dashboard", { bands: getallbands, userprofil: user_profil });
})
app.get('/security', auth, (req, res) => {
    res.render("security");
})

app.get("/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((element) => {
            return element.token !== req.token;
        })
        res.clearCookie("jwt");
        await req.user.save();
        res.render("index",{msg:"Successfully Logout"})
    } catch (error) {
        res.status(500).send(error)
    }
})

// Routing over =-------------------=

// Set a new user in database into the help of register page
app.post('/register', async (req, res) => {
    try {
        password = req.body.password;
        cpassword = req.body.cpassword;

        if (password === cpassword) {
            const passwordhash = await bcrypt.hash(password, 10); // encode with the help of bscrypt model
            const registerUser = new Register({
                name: req.body.name,
                email: req.body.email,
                organization: req.body.organization,
                dateofbirth: req.body.dateofbirth,
                password: passwordhash,
                cpassword: req.body.cpassword,
            });

            // save data into database 
            const regestered = await registerUser.save();
            res.status(201).render("index");

        } else {
            // if password not match go to register page
            res.render("register",{msg:"Password Not Match"});
        }

    } catch (error) {
        // res.status(400).send(error)
        res.send(error);
        console.log(error);
    }
})

// Login check
app.post('/', async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const loginUser = await Register.findOne({ email: email }); // Get excess user with the help of unique email
        const isPasswordMatch = await bcrypt.compare(password, loginUser.password); // bcrypt.compare('loginTimePassword', databaseExcessPassword)

        if (isPasswordMatch) {
            // generate token in register.js part midware if password and email match
            const token = await loginUser.generateToken();

            // create cookie 
            res.cookie("jwl", token, {
                expires: new Date(Date.now() + 86400000),
                httpOnly: true
            });
            res.cookie("email", loginUser.email, {
                expires: new Date(Date.now() + 86400000),
                httpOnly: true
            });

            // Get all bands
            const user_bands = await userBands.find();
            const user_profil = loginUser;
            res.status(201).render("dashboard", { bands: user_bands, userprofil: user_profil });

        }
        else {
            // Redirect to login page if password not math 
            res.status(201).render("index",{msg:"Invalid Login Detail"});
        }

    } catch (error) {
        res.status(201).render("index",{msg:"Invalid Login Details"});

    }
});

// Restpassword 
app.post('/resetpassword', async (req, res) => {
    const email = req.body.email;
    const loginUser = await Register.findOne({ email: email }); // Get excess user with the help of unique email

    // if (loginUser !== '') {
    //     res.send(`user email is ${email}`);
    //     const transporter = nodemailer.createTransport({
    //         service: 'gmail',
    //         auth: {
    //           user: 'rohan222210@gmail.com',
    //           pass: 'xxxxxxxxxxxx'
    //         }
    //       });

    //     const mailOptions = {
    //         from: 'rohan222210@gmail.com',
    //         to: loginUser,
    //         subject: 'Sending Email using Node.js',
    //         text: 'Node js send you to excess the Gmail'
    //       };

    //     transporter.sendMail(mailOptions, function(error, info){
    //         if (error) {
    //           console.log(error);
    //         } else {
    //           console.log('Email sent: ' + info.response);
    //         }
    //       });
    // } else {
    //     res.send(`user email is not correct`);
    // }
});

// register user band 
app.post('/addband', async (req, res) => {
    try {
        // get user email width the help of cookie
        email = req.cookies.email;
        const registerBand = new userBands({
            name: req.body.name,
            email: email,
            description: req.body.description,
            origin: req.body.origin,
            rating: req.body.rating
        });

        // save data into database
        const regestered = await registerBand.save();
        const user_bands = await userBands.find();
        res.status(201).render("dashboard", { bands: user_bands });
    } catch (error) {
        res.status(400).send(error);
    }
});

// Edit User details
app.post('/edituser', async (req, res) => {
    email = req.cookies.email;

    const name = req.body.name;
    const organization = req.body.organization;
    const dateofbirth = req.body.dateofbirth;

    Register.updateOne({ email: email }, { $set: { name: name, organization: organization, dateofbirth: dateofbirth } });
    const loginUser = await Register.findOne({ email: email }); // Get excess user with the help of unique email
    const user_bands = await userBands.find();
    res.status(201).render("dashboard", { bands: user_bands, userprofil: loginUser });
    
});

// server create 
app.listen(port, () => {
    console.log(`Server is running at port no ${port}`);
});