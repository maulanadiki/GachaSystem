const controller = require("./auth_controller");
const core = require("../../libs/core_functions");

module.exports = (app) => {
    // public — no auth needed to reach these
    app.post("/authentication/login", controller.Login);
    app.post("/authentication/register", controller.Register);

    // protected — requires valid SHA256 header + JWT cookie
    // app.get("/authentication/info", core.protect('info'), controller.get);
    app.post("/authentication/logout", core.protect('logout'), controller.Logout);
};

module.exports.publicRoutes = [
    "/authentication/login",
    "/authentication/register",
];