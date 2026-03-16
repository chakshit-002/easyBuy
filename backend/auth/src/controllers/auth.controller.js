const userModel = require('../models/user.model')
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const redis = require('../db/redis')
const { publishToQueue } = require('../broker/broker')


async function registerUser(req, res) {
    try {
        const { username, email, password, fullName: { firstName, lastName }, role } = req.body

        //validation krna pdega kyu ki email ka formate , name sahi hai ya nahi express validator ka use krege -> validator.middleware.js

        const isUserAlreadyExists = await userModel.findOne({
            $or: [
                { username },
                { email }
            ]
        }); //query hai yh ek -> ya username ya email dono mei se ek ya dono se jisshe bhi user mil jaee toh hamhe mil jaega 

        if (isUserAlreadyExists) {
            return res.status(409).json({
                message: "Username or email already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            username,
            email,
            password: hashedPassword,
            fullName: {
                firstName,
                lastName
            },
            role: role || 'user'
        })
        // ab agar user pr find ya findOne lagae toh password nahi aega kyu ki usermodel mei select false krdiey hai password pr 

        //user created and send(publish) to rabbit mq
        // await publishToQueue('AUTH_NOTIFICATION.USER_CREATED', {
        //     id: user._id,
        //     username: user.username,
        //     email: user.email,
        //     fullName: user.fullName
        // })

        // await publishToQueue("AUTH_SELLER_DASHBOARD.USER_CREATED", user);

        await Promise.all([
            publishToQueue('AUTH_NOTIFICATION.USER_CREATED', {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName
            }),
            publishToQueue("AUTH_SELLER_DASHBOARD.USER_CREATED", user)

        ]);

        const token = jwt.sign({
            id: user._id,
            username: user.username,
            role: user.role,
            email: user.email
        }, process.env.JWT_SECRET,
            { expiresIn: '1d' }
        )

        res.cookie('token', token, {
            httpOnly: true,
            secure: true, // client side js hoti hai vo cookies ko access nahi kr paegi only server hi kr skta hai .....
            maxAge: 24 * 60 * 60 * 1000 //1 day
        })

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                addresses: user.addresses
            }
        })
    } catch (error) {
        console.error("Error in register  User ", error);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }

}

async function loginUser(req, res) {
    try {
        const { username, email, password } = req.body;

        const user = await userModel.findOne({ $or: [{ username }, { email }] }).select('+password'); //login krte time password bhi chahiye hota hai compare krne ke liye toh select +password krna pdega kyu ki usermodel mei select false krdiey hai password pr;

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password || '');

        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            message: "Login Successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                addresses: user.addresses
            }
        });

    } catch (err) {
        console.error("Error  in Login User", err);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

async function getCurrentUser(req, res) {
    return res.status(200).json({
        message: "Current user fetched successfully",
        user: req.user
    })
}

async function logoutUser(req, res) {
    const token = req.cookies.token;

    if (token) {
        await redis.set(`blacklist:${token}`, 'true', 'EX', 24 * 60 * 60); //token ko redis mei blacklist krdege aur uska expiry time 1 day rkhdege taki vo token valid na rhe logout krne ke baad
        // JWT tokens ko "cancel" karna mushkil hota hai kyunki wo "stateless" hote hain. Iska hal hai Blacklisting
    }

    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
    })
    return res.status(200).json({
        message: "Logged Out Successfully"
    })
}

async function getUserAddresses(req, res) {
    try {
        const id = req.user.id;
        const user = await userModel.findById(id).select('addresses');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "User addresses fetched successfully",
            addresses: user.addresses || []
        });
    } catch (error) {
        console.error("GET ADDRESS ERROR:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

// 2. ADD NEW ADDRESS
async function addUserAddress(req, res) {
    try {
        const id = req.user.id;
        const { street, city, state, pincode, country, isDefault } = req.body;

        // Basic validation check
        if (!street || !city || !pincode) {
            return res.status(400).json({ message: "Street, City, and Pincode are required" });
        }

        // Agar ye default address hai, toh baaki sab ko false karna padega (Logic fix)
        if (isDefault) {
            await userModel.updateOne(
                { _id: id },
                { $set: { "addresses.$[].isDefault": false } }
            );
        }

        const user = await userModel.findOneAndUpdate(
            { _id: id },
            {
                $push: {
                    addresses: { street, city, state, pincode, country, isDefault: isDefault || false }
                }
            },
            { new: true, runValidators: true } // runValidators check karega ki Schema ke rules follow ho rahe hain
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(201).json({
            message: "Address added successfully",
            address: user.addresses[user.addresses.length - 1],
            allAddresses: user.addresses
        });
    } catch (error) {
        console.error("ADD ADDRESS ERROR:", error);
        return res.status(500).json({ message: "Failed to add address", error: error.message });
    }
}

// 3. DELETE ADDRESS
async function deleteUserAddress(req, res) {
    try {
        const id = req.user.id;
        const { addressId } = req.params;

        // Pehle check karo address format sahi hai ya nahi
        const user = await userModel.findOneAndUpdate(
            { _id: id },
            { $pull: { addresses: { _id: addressId } } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found or Invalid Request" });
        }

        // Verify deletion
        const stillExists = user.addresses.some(addr => addr._id.toString() === addressId);
        if (stillExists) {
            return res.status(500).json({ message: "Database failed to remove the address" });
        }

        return res.status(200).json({
            message: "Address deleted successfully",
            addresses: user.addresses
        });
    } catch (error) {
        console.error("DELETE ADDRESS ERROR:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
module.exports = { registerUser, loginUser, getCurrentUser, logoutUser, getUserAddresses, addUserAddress, deleteUserAddress }


