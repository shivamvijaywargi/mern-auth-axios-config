# AUTH Backend

We will be creating the backend of the auth system
Create `app.js` and `server.js` files and then

```bash
npm init -y
```

Now install the necessary packages using the following command

```bash
npm i express bcryptjs jsonwebtoken cors dotenv mongoose cookie-parser
```

If we missed something we will install that later

Now create a dev script in package.json which will use nodemon, if you do not have nodemon installed globally you can do

```bash
npm i -D nodemon
```

Before starting our project lets do one more thing, lets navigate to `package.json` file and add the following line before scripts

```json
"type": "module",
"scripts": {
  ...
}
```

Now lets head back to app.js and write the following code

```js
import express from "express";

const app = express();

app.get("/", (_req, res) => {
  res.send("Hello from backend");
});

export default app;
```

Now lets import the app in our `server.js`

```js
import app from "./app.js";

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`App is running at http://localhost:${PORT}`);
});
```

- Important Note: Always make sure you are adding .js to your imports if it is your export. Example: Here we have our app so we need to write app.js for it to work, if not you will see an error in the console

  ```bash
  Error [ERR_MODULE_NOT_FOUND]: Cannot find module ............
  ```

Now run `npm run dev` in your terminal and if everything is good, then the server should be listening at http://localhost:3001

Before we forget lets create a .env file in the root of our server folder and add the PORT as well as local MongoDB URL

```env
PORT = 3001

MONGO_URI = mongodb://127.0.0.1:27017/mern-auth
```

Lets create a couple of folders that we will be using in the future

```bash
mkdir configs controllers models middlewares routes
```

Now in the `app.js` lets add couple middlewares that we have already seen in the past

```js
import * as dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

// Built in middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// External middlewares
const corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corsOptions));

app.use(cookieParser());
```

Now let us create a routes file for user

Create a file `user.routes.js` under routes folder and add the following code

```js
import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.send("Hello from router");
});

export default router;
```

Now import this in our `app.js` as shown below

```js
// Importing all routes
import userRoutes from "./routes/user.routes.js";

app.use("/api/v1", userRoutes);
```

Next we will separate the logic in controllers so create a file `user.controllers.js` inside controllers folder

```js
export const registerUser = async (_req, res) => {
  res.send("Hello from router");
};
```

Now import this in `user.routes.js`

```js
import { registerUser } from "../controllers/user.controllers.js";

router.get("/", registerUser);
```

Before creating models, routes and controllers lets initiate connection to DB. Create a file `db.js` inside configs folder

```js
import mongoose from "mongoose";

const connectToDB = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then((conn) => {
      console.log(`Connected to DB: ${conn.connection.host}`);
    })
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
};

export default connectToDB;
```

Now import this inside `server.js` file

```js
import connectToDB from "./configs/db.js";
connectToDB();
```

Now lets create a user schema inside models/User.model.js

```js
import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be atleast 8 characters long"],
  },
});

export default mongoose.model("User", userSchema);
```

Now lets create controller for registering a user

```js
import User from "../models/User.model.js";

export const registerUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be atleast 8 characters long",
    });
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({
      success: false,
      message: "Email already registered",
    });
  }

  const user = await User.create({ email, password });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user,
  });
};
```

Now we are able to register a user but the password is not hashed, lets hash the password

Inside the user model add the following

```js
import bcrypt from "bcryptjs";

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
});
```

Now the passwords will be automatically hashed everytime

Lets now create jwt token issue method inside user model

```js
userSchema.methods = {
  getJWTToken: async function () {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY,
    });
  },
};
```

Now we create a little helper method so we can write less code, lets create a new folder utils in the root and inside it create a file `sendToken.js`

```js
const sendJWTToken = async (res, user, statusCode = 500) => {
  const token = await user.getJWTToken();

  // Setting options for cookies
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRY * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // Sending token in cookie
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token,
  });
};

export default sendJWTToken;
```

This will send token in cookies as well and now we can call this whenever we need by passing `res`, `user`, and `statusCode`

Before we forget lets add COOKIE_EXPIRY, JWT_SECRET and JWT_EXPIRY in our environment variables

Now our registerUser is complete

Before creating login user lets create another helper inside `user.model.js` to compare password

```js
comparePassword: async function (userPassword) {
  return await bcrypt.compare(userPassword, this.password);
},
```

Now create controller for loginUser in `user.controllers.js`

```js
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Email or password is incorrect or user does not exist",
    });
  }

  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    return res.status(400).json({
      success: false,
      message: "Email or password is incorrect or user does not exist",
    });
  }

  sendJWTToken(res, user, 200);
};
```

Lets create logout next

```js
export const logoutUser = async (_req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Logged out successfully",
  });
};
```

and import this in user.routes.js

```js
router.get("/user/logout", logoutUser);
```

Finally lets create a protected route which only logged in users can view

In order to do that lets create a middleware called `auth.middleware.js`

```js
import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  // const token = req.headers.authorization;
  let token = req.cookies.token
    ? req.cookies?.token
    : req.headers?.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);

  req.user = decodedToken._id;

  next();
};

export default isAuthenticated;
```

Next lets createa route and add this middleware to it

in `user.routes.js`

```js
import isAuthenticated from "../middlewares/auth.middleware.js";

router.get("/user/me", isAuthenticated, isLoggedIn);
```

Finally in `user.controller.js`

```js
export const isLoggedIn = async (req, res) => {
  const user = await User.findById(req.user);

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Unauthorized",
    });
  }

  res.status(200).json({
    success: true,
    message: "Welcome",
  });
};
```

If I have not missed anything in the md file, with this our backend is complete
