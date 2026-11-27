const bodyParser = require("body-parser");
const express = require("express");
const Users = require("../data/users");
const cookieParser = require("cookie-parser");
const VerifyToken = require("../middleware/token");

// Online the cookie goes between two sites (Vercel -> Render): needs secure + sameSite none
const isProduction = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
};

function AuthRouter() {
  let router = express();

  router.use(bodyParser.json({ limit: "100mb" }));
  router.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

  router.route("/register").post(function (req, res, next) {
    const body = req.body;

    const { role } = body;

    if (!role.scopes.includes("admin")) {
      return res
        .status(401)
        .send({ auth: false, message: "Only create Admin" });
    }

    Users.create(body)
      .then(() => Users.createToken(body))
      .then((response) => {
        res.status(200);
        res.send(response);
      })
      .catch((err) => {
        res.status(500);
        res.send(err);
        next();
      });
  });

  router.route("/login").post(function (req, res, next) {
    let body = req.body;

    return Users.findUser(body)
      .then((user) => {
        return Users.createToken(user);
      })
      .then((response) => {
        console.log("response", response);
        // httpOnly: JS can't read the cookie, but it is still sent to the server
        res.cookie("token", response.token, cookieOptions);
        res.status(200);
        res.send(response);
      })
      .catch((err) => {
        console.log("error", err);
        res.status(500);
        res.send(err);
      });
  });

  router.use(cookieParser());
  router.use(VerifyToken);

  router.route("/logout").get(function (req, res, next) {
    // maxAge 0 deletes the cookie
    res.cookie("token", req.cookies.token, { ...cookieOptions, maxAge: 0 });

    res.status(200);
    res.send({ logout: true });
    next();
  });

  router.route("/me").get(function (req, res, next) {
    return new Promise(() => {
      res.status(202).send({ auth: true, decoded: req.roleUser });
    }).catch((err) => {
      res.status(500);
      res.send(err);
      next();
    });
  });

  return router;
}

module.exports = AuthRouter;
