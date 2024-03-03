const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");
const store = new session.MemoryStore();
const cors = require("cors");
const User = require("./userModel");
const City = require("./cityModel");

// const Education = require("./educationModel");

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cors());

// app.use(
//   session({
//     secret: "your-secret-key", // Change this to a secret of your choice
//     resave: false,
//     saveUninitialized: false,
//   })
// );

app.use(
  session({
    secret: "your-secret-key", // Change this to a secret of your choice
    cookie: { maxAge: 30000 },
    resave: false,
    saveUninitialized: false,
    store:store
  })
);

// Middleware for session handling
const checkLoggedIn = (req) => {
  const email = req.session.email;
  if (!email) {
    return false;
  } else {
    return true;
  }
};

app.use((req,res,next)=>{
  console.log(store);
  console.log(`${req.method}-${req.url}`)
  console.log(req.session);
  next()
})

// // Education
//not needed
// app.post("/education/", async (req, res) => {
//   try {
//     const existingUser = await User.findOne({ email: req.session.email });
//     const education = new Education({
//       user: existingUser._id,
//       presentClass: req.body.presentClass,
//       course: req.body.course,
//     });
//     await education.save();
//     res.status(201).send();
//   } catch (error) {
//     console.log(error);
//     res.status(400).send(error);
//   }
// });

// app.get("/education", async (req, res) => {
//   try {
//     const education = await Education.findOne({
//       user: (await User.findOne({ email: req.session.email }))._id,
//     });
//     if (education) {
//       res.status(200).send(education);
//     } else {
//       res.status(404).send("Education data not found");
//     }
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });

// // Register
app.post("/register", async (req, res) => {
  try {
    try {
      const { email } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "Email is already registered" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
    console.log(req.body)
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      dob: req.body.dob,
      gender: req.body.gender,
      cast: req.body.cast,
      city: req.body.city,
      family: req.body.family,
      income: req.body.income,
      religion: req.body.religion,
      password: hashedPassword,
      address: req.body.address,
      presentClass: req.body.presentClass,
      course: req.body.course,
    });
    await user.save();

    res.status(201).send();
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

// // Login
app.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (user === null) {
    return res.status(400).send("Not Registered");
  }

  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      req.session.email = req.body.email;
      res.status(200).send("user logged in");
    } else {
      res.status(400).send("wrong pwd");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

// // Test Session
app.get("/ses", (req, res) => {
  if (req.session && req.session.auth){
    console.log(req.sessionID);
    req.session.auth = true;
    res.json(req.session.auth);
      
  }
  res.status(500).send();
  // if (req.session.email) {
  //   const resp = { email: req.session.email };
  //   res.send(`Welcome, ${resp}`);
  // } else {
  //   res.send("Not logged in");
  // }
});

// // Get user Details
app.get("/user", async (req, res) => {
  try {
    const logIn = checkLoggedIn(req);
    if (!logIn) {
      return res.status(404).send("User not Logged In");
    }

    const user = await User.findOne({ email: req.session.email }).select({
      _id: 0,
      name: 1,
      email: 1,
      dob: 1,
      gender: 1,
      cast: 1,
      city: 1,
      family: 1,
      income: 1,
      religion: 1,
      address: 1,
      presentClass: 1,
      course: 1,
    });
    if (!user) {
      return res.status(404).send("User not found");
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// // Update User record
app.put("/user", async (req, res) => {
  // // example body
  // {
  //   "personal": {
  //     "name": "abhi Doe",
  //     "dob": "1990-01-01",
  //     "gender": "male",
  //     "cast": "Some Cast",
  //     "city": "Amd",
  //     "family": 4,
  //     "income": 50000,
  //     "religion": "Some Religion",
  //     "address": "123 Main Street"
  //   },
  //   "education": {
  //     "presentClass": "12th",
  //     "course": "Science"
  //   }
  // }
  try {
    const user = await User.findOneAndUpdate(
      { email: req.session.email },
      req.body,
      { new: true }
    );
    if (!user) {
      return res.status(404).send("User not found");
    }
    // const education = await Education.findOneAndUpdate(
    //   { user: user._id },
    //   req.body.education,
    //   {
    //     new: true,
    //     upsert: true,
    //   }
    // );

    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(400).send("Bad Request");
  }
});

// // Delete Register record
{
  // app.delete('/register/:id', async (req, res) => {
  //   try {
  //     const Register = await Register.findByIdAndDelete(req.params.id);
  //     if (!Register) {
  //       return res.status(404).send();
  //     }
  //     res.send(Register);
  //   } catch (error) {
  //     res.status(500).send(error);
  //   }
  // });
}

// // Cities
app.get("/city", async (req, res) => {
  try {
    const cities = await City.find();
    res.send(cities);
  } catch (error) {
    res.status(500).send(error);
  }
});

// // Schemes
app.post("/schemes", async (req, res) => {
  try {
    try {
      const { email } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "Email is already registered" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://testuser:0QpsAQRgpJkIJfL3@cluster0.jyiybpf.mongodb.net/"
  )
  .then(() => {
    console.log("Connected to MongoDB");

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });
