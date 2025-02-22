const md5 = require("md5");
const User = require("../models/user.model");
const ForgotPassword = require("../models/forgot-password.model");

const generateHelper = require("../../../helpers/generate");
const sendMailHelper = require("../../../helpers/sendMail");

// [POST] /api/v1/users/register
module.exports.register = async (req, res) => {
    req.body.password = md5(req.body.password);

    const exitEmail = await User.findOne({
        email: req.body.email,
        deleted: false
    });

    // check email tồn tại chưa
    if (exitEmail) {
        res.json({
            code: 400,
            message: "Email đã tồn tại!"
        });
    } else {
        const user = new User({
            fullName: req.body.fullName,
            email: req.body.email,
            password: req.body.password
        });

        // save user vào db
        user.save();

        const token = user.token;
        res.cookie("token", token);

        res.json({
            code: 200,
            message: "Tạo tài khoản thành công!",
            token: token
        });
    } 
};

// [POST] /api/v1/users/login
module.exports.login = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({
        email: email,
        deleted: false
    });

    if (!user) {
        res.json({
            code: 400,
            message: "Email đã tồn tại!"
        });
        return;
    }

    if (md5(password) != user.password) {
        res.json({
            code: 400,
            message: "Sai mật khẩu!"
        });
        return;
    }

    const token = user.token;
    res.cookie("token", token);

    res.json({
        code: 200,
        message: "Đăng nhập thành công!",
        token: token
    });
};

// [POST] /api/v1/users/password/forgot
module.exports.forgotPassword = async (req, res) => {
    const email = req.body.email;

    const user = await User.findOne({
        email: email,
        deleted: false
    });

    if (!user) {
        res.json({
            code: 400,
            message: "Email không tồn tại!"
        });
    }

    // mã otp
    const otp = generateHelper.generateRandomNumber(8);

    // thời gian hết hạn
    const timeExpire = 5;

    const objectForgotPassword = {
        email: email,
        otp: otp,
        expireAt: Date.now() + timeExpire*60
    };

    // lưu data vào database
    const forgotPassword = new ForgotPassword(objectForgotPassword);
    forgotPassword.save();

    // gửi OTP qua email user
    const subject = "Mã OTP xác minh lấy lại mật khẩu";
    const html = `
        Mã OTP để lấy lại mật khẩu của bạn là <b>${otp}</b> (Sử dụng trong thời gian ${timeExpire} phút).
        Vui lòng không chia sẽ mã OTP với bất kỳ ai.
    `;
    sendMailHelper.sendMail(email, subject, html);
    
    res.json({
        code: 200,
        message: "Đã gửi mã OTP qua email"
    });
};

// [POST] /api/v1/users/password/otp
module.exports.otpPassword = async (req, res) => {
    const email = req.body.email;
    const otp = req.body.otp;

    const result = await ForgotPassword.findOne({
        email: email,
        otp: otp
    });

    if (!result) {
        res.json({
            code: 400,
            message: "Mã OTP không hợp lệ"
        });
        return;
    }

    // lấy ra user của email hợp lệ để lấy token
    const user = await User.findOne({
        email: email
    });

    const token = user.token;
    res.cookie("token", token);
    
    res.json({
        code: 200,
        message: "Xác thực thành công",
        token: token
    });
};

// [POST] /api/v1/users/password/reset
module.exports.resetPassword = async (req, res) => {
    // const token = req.body.token;
    const token = req.cookies.token;
    const password = req.body.password;

    // check user theo token
    const user = await User.findOne({
        token: token
    });

    // yêu cầu nhập mật khẩu khác mật khẩu cũ
    if (md5(password) === user.password) {
        res.json({
            code: 400,
            message: "Vui lòng nhập mật khẩu khác mật khẩu cũ"
        });
        return;
    }

    // lưu data vào database
    await User.updateOne({
        token: token
    }, {
        password: md5(password)
    });
    
    res.json({
        code: 200,
        message: "Đổi mật khẩu thành công"
    });
};

// [GET] /api/v1/users/detail
module.exports.detail = async (req, res) => {
    // const token = req.cookies.token;

    // // thông tin user(ngoại trừ password token)
    // const user = await User.findOne({
    //     token: token,
    //     deleted: false
    // }).select("-password -token");

    res.json({
        code: 200,
        message: "Thông tin user",
        infoUser: req.user
    });
};