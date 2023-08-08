const User = require('../models/userModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel')
const Coupon = require('../models/couponModel');
const Order = require('../models/orderModel');

const uniqid = require('uniqid');
const { generateToken } = require('../config/jwtToken');
const asyncHandler = require('express-async-handler');
const validateMongodbId = require('../util/validateMogodbId');
const { generateRefreshToken } = require('../config/refreshToken');
const jwt = require('jsonwebtoken');
const sendEmail = require('./emailController');
const crypto = require('crypto')
// User register 
const createUser = asyncHandler(
    async (req, res) => {
        const email = req.body.email;
        const findUser = await User.findOne({ email: email });
        //check user 
        if (!findUser) {
            //create user
            const newUser = await User.create(req.body);
            res.json(newUser);
        }
        else {
            //user already exists
            throw new Error("User already exists")
        }

    }
);
//User login
const userLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    //check user exists or not
    const findUser = await User.findOne({ email: email });
    if (findUser && (await findUser.isPasswordMatch(password))) {
        const refreshToken = await generateRefreshToken(findUser?._id)
        const updateUser = await User.findByIdAndUpdate(
            findUser.id,
            {
                refreshToken: refreshToken
            },
            {
                new: true
            }
        );
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        })

        res.json({
            _id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id)
        })
    }
    else {
        throw new Error("Invalid Credentials")
    }
});

// admin login

const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // check if user exists or not
    const findAdmin = await User.findOne({ email });
    if (findAdmin.role !== "admin") throw new Error("Not Authorised");
    if (findAdmin && (await findAdmin.isPasswordMatch(password))) {
        const refreshToken = await generateRefreshToken(findAdmin?._id);
        const updateuser = await User.findByIdAndUpdate(
            findAdmin.id,
            {
                refreshToken: refreshToken,
            },
            { new: true }
        );
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        });
        res.json({
            _id: findAdmin?._id,
            firstname: findAdmin?.firstname,
            lastname: findAdmin?.lastname,
            email: findAdmin?.email,
            mobile: findAdmin?.mobile,
            token: generateToken(findAdmin?._id),
        });
    } else {
        throw new Error("Invalid Credentials");
    }
});


//handle refresh token

const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies
    if (!cookie?.refreshToken) throw new Error("no refresh token in cookie");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken })
    if (!user) throw new Error("No refresh token present in db or not matched")
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decode) => {
        if (err || user.id !== decode.id) {
            throw new Error("There is something went wrong with refresh token")
        }
        const accessToken = generateToken(user?._id)
        res.json({ accessToken })
    })
});

//logout funtionality
const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies
    if (!cookie?.refreshToken) throw new Error("no refresh token in cookie");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken })
    if (!user) {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
        });
        return res.sendStatus(204) //forbidden
    }
    await User.findOneAndUpdate({ refreshToken }, {
        refreshToken: "",
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
    });
    res.sendStatus(204) //forbidden
})

//Update User 
const updateUser = asyncHandler(async (req, res) => {
    const { _id } = req.user
    validateMongodbId(_id)
    try {
        const updateUser = await User.findByIdAndUpdate(
            _id,
            {
                firstname: req?.body?.firstname,
                lastname: req?.body?.lastname,
                email: req?.body?.email,
                mobile: req?.body?.mobile
            },
            {
                new: true
            }
        );
        res.json({
            updateUser
        })

    } catch (err) {
        throw new Error(err)
    }
})

//Get all users
const getUser = asyncHandler(async (req, res) => {
    try {
        const user = await User.find()
        res.json(user)
    } catch (err) {
        throw new Error(err)
    }
});

// save user Address

const saveAddress = asyncHandler(async (req, res, next) => {
    const { _id } = req.user;
    validateMongodbId(_id);

    try {
        const updatedUser = await User.findByIdAndUpdate(
            _id,
            {
                address: req?.body?.address,
            },
            {
                new: true,
            }
        );
        res.json(updatedUser);
    } catch (error) {
        throw new Error(error);
    }
});



//Get a single user
const getSingleUser = asyncHandler(async (req, res) => {
    const { id } = req.params
    validateMongodbId(id);
    try {
        const user = await User.findById(id)
        res.json(user)
    } catch (err) {
        throw new Error(err)
    }
});
//Delete a user
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params
    validateMongodbId(id);
    try {
        const user = await User.findByIdAndDelete(id)
        res.json(user)
    } catch (err) {
        throw new Error(err)
    }
});

const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params
    validateMongodbId(id);
    try {
        const block = await User.findByIdAndUpdate(
            id,
            {
                isBlocked: true,
            },
            {
                new: true,
            }
        );
        res.json({
            message: "user blocked"
        })
    } catch (err) {
        throw new Error(err)
    }

})
const unblockUser = asyncHandler(async (req, res) => {
    const { id } = req.params
    validateMongodbId(id)
    try {
        const block = await User.findByIdAndUpdate(
            id,
            {
                isBlocked: false,
            },
            {
                new: true,
            }
        );
        res.json({
            message: "user unblocked"
        })
    } catch (err) {
        throw new Error(err)
    }

});
//change password
const updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const { password } = req.body
    validateMongodbId(_id)
    const user = await User.findById(_id)
    if (password) {
        user.password = password
        const passwordUpdated = await user.save()
        res.json(passwordUpdated)
    } else {
        res.json(user)
    }
});

//forgot password
const forgotPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found with this email");
    try {
        const token = await user.createPasswordResetToken();
        await user.save();
        const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes from now. <a href='http://localhost:4000/api/user/reset-password/${token}'>Click Here</>`;
        const data = {
            to: email,
            text: "Hey User",
            subject: "Forgot Password Link",
            html: resetURL,
        };
        sendEmail(data)
        res.json(token);
    } catch (error) {
        throw new Error(error);
    }
});

const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    const hashedtoken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashedtoken,
        passwordResetExpires: { $gt: Date.now() }
    })
    if (!user) throw new Error("Token Expired, Please try again later");
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user)
});

const getWishlist = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    try {

        const fineUser = await User.findById(_id).populate("wishlist");
        res.json(fineUser)

    } catch (err) {
        throw new Error(err)
    }
});

const userCart = asyncHandler(async (req, res) => {
    const { cart } = req.body;
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        let products = [];
        const user = await User.findById(_id);
        // check if user already have product in cart
        const alreadyExistCart = await Cart.findOne({ orderby: user._id });
        if (alreadyExistCart) {
            alreadyExistCart.remove();
        }
        for (let i = 0; i < cart.length; i++) {
            let object = {};
            object.product = cart[i]._id;
            object.count = cart[i].count;
            object.color = cart[i].color;
            let getPrice = await Product.findById(cart[i]._id).select("price").exec();
            object.price = getPrice.price;
            products.push(object);
        }
        let cartTotal = 0;
        for (let i = 0; i < products.length; i++) {
            cartTotal = cartTotal + products[i].price * products[i].count;
        }
        let newCart = await new Cart({
            products,
            cartTotal,
            orderby: user?._id,
        }).save();
        res.json(newCart);
    } catch (error) {
        throw new Error(error);
    }
});

const getUserCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        const cart = await Cart.findOne({ orderby: _id }).populate(
            "products.product"
        );
        res.json(cart);
    } catch (error) {
        throw new Error(error);
    }
});

const emptyCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        const user = await User.findOne({ _id });
        const cart = await Cart.findOneAndRemove({ orderby: user._id });
        res.json(cart);
    } catch (error) {
        throw new Error(error);
    }
});

const applyCoupon = asyncHandler(async (req, res) => {
    const { coupon } = req.body;
    const { _id } = req.user;
    validateMongodbId(_id);
    const validCoupon = await Coupon.findOne({ name: coupon });
    if (validCoupon === null) {
        throw new Error("Invalid Coupon");
    }
    const user = await User.findOne({ _id });
    let { cartTotal } = await Cart.findOne({
        orderby: user._id,
    }).populate("products.product");
    let totalAfterDiscount = (
        cartTotal -
        (cartTotal * validCoupon.discount) / 100
    ).toFixed(2);
    await Cart.findOneAndUpdate(
        { orderby: user._id },
        { totalAfterDiscount },
        { new: true }
    );
    res.json(totalAfterDiscount);
});

const createOrder = asyncHandler(async (req, res) => {
    const { COD, couponApplied } = req.body;
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        if (!COD) throw new Error("Create cash order failed");
        const user = await User.findById(_id);
        let userCart = await Cart.findOne({ orderby: user._id });
        let finalAmout = 0;
        if (couponApplied && userCart.totalAfterDiscount) {
            finalAmout = userCart.totalAfterDiscount;
        } else {
            finalAmout = userCart.cartTotal;
        }

        let newOrder = await new Order({
            products: userCart.products,
            paymentIntent: {
                id: uniqid(),
                method: "COD",
                amount: finalAmout,
                status: "Cash on Delivery",
                created: Date.now(),
                currency: "usd",
            },
            orderby: user._id,
            orderStatus: "Cash on Delivery",
        }).save();
        let update = userCart.products.map((item) => {
            return {
                updateOne: {
                    filter: { _id: item.product._id },
                    update: { $inc: { quantity: -item.count, sold: +item.count } },
                },
            };
        });
        const updated = await Product.bulkWrite(update, {});
        res.json({ message: "success" });
    } catch (error) {
        throw new Error(error);
    }
});

const getOrders = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        const userorders = await Order.findOne({ orderby: _id })
            .populate("products.product")
            .populate("orderby")
            .exec();
        res.json(userorders);
    } catch (error) {
        throw new Error(error);
    }
});

const getAllOrders = asyncHandler(async (req, res) => {
    try {
        const alluserorders = await Order.find()
            .populate("products.product")
            .populate("orderby")
            .exec();
        res.json(alluserorders);
    } catch (error) {
        throw new Error(error);
    }
});
const getOrderByUserId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const userorders = await Order.findOne({ orderby: id })
            .populate("products.product")
            .populate("orderby")
            .exec();
        res.json(userorders);
    } catch (error) {
        throw new Error(error);
    }
});
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const updateOrderStatus = await Order.findByIdAndUpdate(
            id,
            {
                orderStatus: status,
                paymentIntent: {
                    status: status,
                },
            },
            { new: true }
        );
        res.json(updateOrderStatus);
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    createUser,
    userLogin,
    getUser,
    getSingleUser,
    deleteUser,
    updateUser,
    blockUser,
    unblockUser,
    handleRefreshToken,
    logout,
    updatePassword,
    forgotPasswordToken,
    resetPassword,
    loginAdmin,
    getWishlist,
    saveAddress,
    userCart,
    getUserCart,
    emptyCart,
    applyCoupon,
    createOrder,
    getOrders,
    getAllOrders,
    getOrderByUserId,
    updateOrderStatus
};