'use strict';

const { isEmail, isUUID } = require('validator');
const { signFreshdesk, signZendesk } = require('../helpers/plugins');
const toolsLib = require('hollaex-tools-lib');
const { sendEmail } = require('../../mail');
const { MAILTYPE } = require('../../mail/strings');
const { loggerUser } = require('../../config/logger');
const {
	USER_VERIFIED,
	PROVIDE_VALID_EMAIL_CODE,
	USER_REGISTERED,
	USER_NOT_FOUND,
	SERVICE_NOT_SUPPORTED,
	VERIFICATION_EMAIL_MESSAGE,
	TOKEN_REMOVED
} = require('../../messages');

const signUpUser = (req, res) => {
	const {
		email,
		password,
		captcha,
		referral
	} = req.swagger.params.signup.value;
	const ip = req.headers['x-real-ip'];
	loggerUser.debug(
		req.uuid,
		'controllers/user/signUpUser',
		req.swagger.params.signup.value,
		ip
	);

	toolsLib.security.checkCaptcha(captcha, ip)
		.then(() => {
			return toolsLib.user.signUpUser(email, password, referral);
		})
		.then(() => {
			return res.status(201).json({ message: USER_REGISTERED });
		})
		.catch((err) => {
			loggerUser.error(req.uuid, 'controllers/user/signUpUser', err.message);
			let status = err.status || 400;
			let message = err.message;
			if (err.name === 'SequelizeValidationError') {
				message = err.errs[0].message;
			}
			return res.status(status).json({ message });
		});
};

const getVerifyUser = (req, res) => {
	const email = req.swagger.params.email.value;
	const verification_code = req.swagger.params.verification_code.value;
	const resendEmail = req.swagger.params.resend.value;
	const domain = req.headers['x-real-origin'];
	let promiseQuery;

	if (email && isEmail(email)) {
		promiseQuery = toolsLib.user.getVerificationCodeByUserEmail(email)
			.then((verificationCode) => {
				if (resendEmail) {
					sendEmail(
						MAILTYPE.SIGNUP,
						email,
						verificationCode.code,
						{},
						domain
					);
				}
				return res.json({
					email,
					verification_code: verificationCode.code,
					message: VERIFICATION_EMAIL_MESSAGE
				});
			});
	} else if (verification_code && isUUID(verification_code)) {
		promiseQuery = toolsLib.user.getUserEmailByVerificationCode(verification_code)
			.then((userEmail) => {
				return res.json({
					email: userEmail,
					verification_code,
					message: VERIFICATION_EMAIL_MESSAGE
				});
			});
	} else {
		return res.status(400).json({
			message: PROVIDE_VALID_EMAIL_CODE
		});
	}

	promiseQuery
		.catch((err) => {
			loggerUser.error(req.uuid, 'controllers/user/getVerifyUser', err.message);
			if (err.message === USER_NOT_FOUND) {
				return res.json({ message: VERIFICATION_EMAIL_MESSAGE });
			}
			return res.status(err.status || 400).json({ message: err.message });
		});
};

const verifyUser = (req, res) => {
	const { email, verification_code } = req.swagger.params.data.value;
	const domain = req.headers['x-real-origin'];

	toolsLib.user.verifyUser(email, verification_code, domain)
		.then(() => {
			return res.json({ message: USER_VERIFIED });
		})
		.catch((err) => {
			loggerUser.error(req.uuid, 'controllers/user/verifyUser', err.message);
			return res.status(err.status || 400).json({ message: err.message });
		});
};

const loginPost = (req, res) => {
	const {
		email,
		password,
		otp_code,
		captcha,
		service
	} = req.swagger.params.authentication.value;
	const ip = req.headers['x-real-ip'];
	const device = req.headers['user-agent'];
	const domain = req.headers['x-real-origin'];
	const origin = req.headers.origin;
	const referer = req.headers.referer;
	const time = new Date();

	toolsLib.user.loginUser(email, password, otp_code, captcha, ip, device, domain, origin, referer)
		.then((user) => {
			const data = {
				ip,
				time,
				device
			};
			if (!service) {
				sendEmail(MAILTYPE.LOGIN, email, data, user.settings, domain);
			} else {
				// This login is for a third party service e.g. FreshDesk
				if (service === 'freshdesk') {
					const url = signFreshdesk(user);
					// in case login is through freshdesk
					return res.status(201).json({ service, callbackUrl: url });
				} else if (service === 'zendesk') {
					const url = signZendesk(user);
					// in case login is through zendesk
					return res.status(201).json({ service, callbackUrl: url });
				} else {
					throw new Error(SERVICE_NOT_SUPPORTED);
				}
			}
			return res.status(201).json({
				token: toolsLib.security.issueToken(
					user.id,
					user.network_id,
					email,
					ip,
					user.is_admin,
					user.is_support,
					user.is_supervisor,
					user.is_kyc,
					user.is_communicator
				)
			});
		})
		.catch((err) => {
			loggerUser.error(req.uuid, 'controllers/user/loginPost catch', err.message);
			return res.status(403).json({ message: err.message });
		});
};

const verifyToken = (req, res) => {
	loggerUser.debug(req.uuid, 'controllers/user/verifyToken', req.auth.sub);
	return res.json({ message: 'Valid Token' });
};

const requestResetPassword = (req, res) => {
	const email = req.swagger.params.email.value;
	const ip = req.headers['x-real-ip'];
	const domain = req.headers['x-real-origin'];
	const captcha = req.swagger.params.captcha.value;

	toolsLib.security.sendResetPasswordCode(email, captcha, ip, domain)
		.then(() => {
			return res.json({ message: `Password request sent to: ${email}` });
		})
		.catch((err) => {
			if (err.message === USER_NOT_FOUND) {
				return res.json({ message: `Password request sent to: ${email}` });
			}
			loggerUser.error(req.uuid, 'controllers/user/requestResetPassword', err.message);
			return res.status(err.status || 400).json({ message: err.message });
		});
};

const resetPassword = (req, res) => {
	const { code, new_password } = req.swagger.params.data.value;

	toolsLib.security.resetUserPassword(code, new_password)
		.then(() => {
			return res.json({ message: 'Password updated.' });
		})
		.catch((err) => {
			loggerUser.error(req.uuid, 'controllers/user/resetPassword', err.message);
			return res.status(err.status || 400).json({ message: 'Invalid code' });
		});
};

const getUser = (req, res) => {
	loggerUser.debug(req.uuid, 'controllers/user/getUser', req.auth.sub);
	const email = req.auth.sub.email;

	toolsLib.user.getUserByEmail(email, true, true)
		.then((user) => {
			delete user.password;
			return res.json(user);
		})
		.catch((err) => {
			loggerUser.error(req.uuid, 'controllers/user/getUser', err.message);
			return res.status(err.status || 400).json({ message: err.message });
		});
};

const updateSettings = (req, res) => {
	loggerUser.debug(req.uuid, 'controllers/user/updateSettings', req.auth.sub);
	const email = req.auth.sub.email;
	loggerUser.debug(
		req.uuid,
		'controllers/user/updateSettings',
		req.swagger.params.data.value
	);
	const data = req.swagger.params.data.value;

	toolsLib.user.updateUserSettings({ email }, data)
		.then((user) => res.json(user))
		.catch((err) => {
			loggerUser.error(req.uuid, 'controllers/user/updateSettings', err.message);
			return res.status(err.status || 400).json({ message: err.message });
		});
};

const changePassword = (req, res) => {
	loggerUser.debug(req.uuid, 'controllers/user/changePassword', req.auth.sub);
	const email = req.auth.sub.email;
	const { old_password, new_password } = req.swagger.params.data.value;
	loggerUser.debug(
		req.uuid,
		'controllers/user/changePassword',
		req.swagger.params.data.value
	);

	toolsLib.security.changeUserPassword(email, old_password, new_password)
		.then(() => res.json({ message: 'Success' }))
		.catch((err) => {
			loggerUser.error(req.uuid, 'controllers/user/changePassword', err.message);
			return res.status(err.status || 400).json({ message: err.message });
		});
};

const setUsername = (req, res) => {
	loggerUser.debug(req.uuid, 'controllers/user/setUsername auth', req.auth.sub);

	const { id } = req.auth.sub;
	const { username } = req.swagger.params.data.value;

	toolsLib.user.setUsernameById(id, username)
		.then(() => res.json({ message: 'Username successfully changed' }))
		.catch((err) => {
			loggerUser.error(req.uuid, 'controllers/user/setUsername', err.message);
			return res.status(err.status || 400).json({ message: err.message });
		});
};

const getUserLogins = (req, res) => {
	loggerUser.debug(req.uuid, 'controllers/user/getUserLogins auth', req.auth.sub);

	const user_id = req.auth.sub.id;
	const { limit, page, order_by, order, start_date, end_date, format } = req.swagger.params;

	toolsLib.user.getUserLogins(user_id, limit.value, page.value, order_by.value, order.value, start_date.value, end_date.value, format.value)
		.then((data) => {
			if (format.value) {
				res.setHeader('Content-disposition', `attachment; filename=${toolsLib.getKitConfig().api_name}-logins.csv`);
				res.set('Content-Type', 'text/csv');
				return res.status(202).send(data);
			} else {
				return res.json(data);
			}
		})
		.catch((err) => {
			loggerUser.error(req.uuid, 'controllers/user/getUserLogins', err.message);
			return res.status(err.status || 400).json({ message: err.message });
		});
};

const affiliationCount = (req, res) => {
	loggerUser.debug(req.uuid, 'controllers/user/affiliationCount auth', req.auth.sub);

	const user_id = req.auth.sub.id;
	toolsLib.user.getAffiliationCount(user_id)
		.then((num) => {
			loggerUser.verbose(req.uuid, 'controllers/user/affiliationCount', num);
			return res.json({ count: num });
		})
		.catch((err) => {
			loggerUser.error(req.uuid, 'controllers/user/affiliationCount', err.message);
			return res.status(err.status || 400).json({ message: err.message });
		});
};

const getUserBalance = (req, res) => {
	loggerUser.debug(req.uuid, 'controllers/user/getUserBalance auth', req.auth.sub);
	const user_id = req.auth.sub.id;

	toolsLib.wallet.getUserBalanceByKitId(user_id)
		.then((balance) => {
			return res.json(balance);
		})
		.catch((err) => {
			loggerUser.error(req.uuid, 'controllers/user/getUserBalance', err.message);
			return res.status(err.status || 400).json({ message: err.message });
		});
};

const deactivateUser = (req, res) => {
	loggerUser.verbose(
		req.uuid,
		'controllers/user/deactivateUser/auth',
		req.auth
	);
	const { id, email } = req.auth.sub;

	toolsLib.user.freezeUserById(id)
		.then(() => {
			return res.json({ message: `Account ${email} deactivated` });
		})
		.catch((err) => {
			loggerUser.error(
				req.uuid,
				'controllers/user/deactivateUser',
				err.message
			);
			return res.status(err.status || 400).json({ message: err.message });
		});
};

const createCryptoAddress = (req, res) => {
	loggerUser.debug(
		req.uuid,
		'controllers/user/createCryptoAddress',
		req.auth.sub
	);

	const { id } = req.auth.sub;
	const crypto = req.swagger.params.crypto.value;

	if (!crypto || !toolsLib.subscribedToCoin(crypto)) {
		loggerUser.error(
			req.uuid,
			'controllers/user/createCryptoAddress',
			`Invalid crypto: "${crypto}"`
		);
		return res.status(404).json({ message: `Invalid crypto: "${crypto}"` });
	}

	toolsLib.user.createUserCryptoAddressByKitId(id, crypto)
		.then((data) => {
			return res.status(201).json(data);
		})
		.catch((err) => {
			loggerUser.error(
				req.uuid,
				'controllers/user/createCryptoAddress',
				err.message
			);
			return res.status(err.status || 400).json({ message: err.message });
		});
};

const getHmacToken = (req, res) => {
	loggerUser.verbose(req.uuid, 'controllers/user/getHmacToken auth', req.auth.sub);

	const { id } = req.auth.sub;

	toolsLib.security.getUserKitHmacTokens(id)
		.then((tokens) => {
			return res.json(tokens);
		})
		.catch((err) => {
			loggerUser.error(
				req.uuid,
				'controllers/user/getHmacToken err',
				err.message
			);
			res.status(err.status || 400).json({ message: err.message });
		});
};

const createHmacToken = (req, res) => {
	loggerUser.verbose(
		req.uuid,
		'controllers/user/createHmacToken auth',
		req.auth.sub
	);

	const { id } = req.auth.sub;
	const ip = req.headers['x-real-ip'];
	const { name, otp_code } = req.swagger.params.data.value;

	toolsLib.security.createUserKitHmacToken(id, otp_code, ip, name)
		.then((token) => {
			return res.json(token);
		})
		.catch((err) => {
			loggerUser.error(
				req.uuid,
				'controllers/user/createHmacToken',
				err.message
			);
			return res.status(err.status || 400).json({ message: err.message });
		});
};

const deleteHmacToken = (req, res) => {
	loggerUser.verbose(
		req.uuid,
		'controllers/user/deleteHmacToken auth',
		req.auth.sub
	);

	const { id } = req.auth.sub;
	const { token_id, otp_code } = req.swagger.params.data.value;

	toolsLib.security.deleteUserKitHmacToken(id, otp_code, token_id)
		.then(() => {
			return res.json({ message: TOKEN_REMOVED });
		})
		.catch((err) => {
			loggerUser.error(
				req.uuid,
				'controllers/user/deleteHmacToken',
				err.message
			);
			return res.status(err.status || 400).json({ message: err.message });
		});
};

const getUserStats = (req, res) => {
	loggerUser.verbose(
		req.uuid,
		'controllers/user/getUserStats',
		req.auth.sub
	);
	const user_id = req.auth.sub.id;

	toolsLib.user.getUserStatsByKitId(user_id)
		.then((stats) => {
			return res.json(stats);
		})
		.catch((err) => {
			loggerUser.error('controllers/user/getUserStats', err.message);
			return res.status(err.status || 400).json({ message: err.message });
		});
};

const cancelWithdrawal = (req, res) => {
	loggerUser.verbose(
		req.uuid,
		'controllers/user/cancelWithdrawal auth',
		req.auth
	);

	const userId = req.auth.sub.id;
	const { transaction_id } = req.swagger.params.data.value;

	toolsLib.wallet.cancelUserWithdrawalByKitId(userId, transaction_id)
		.then((withdrawal) => {
			return res.json(withdrawal);
		})
		.catch((err) => {
			loggerUser.error(
				req.uuid,
				'controllers/user/cancelWithdrawal',
				err.message
			);
			return res.status(err.status || 400).json({ message: err.message });
		});
};

module.exports = {
	signUpUser,
	getVerifyUser,
	verifyUser,
	loginPost,
	verifyToken,
	requestResetPassword,
	resetPassword,
	getUser,
	updateSettings,
	changePassword,
	setUsername,
	getUserLogins,
	affiliationCount,
	getUserBalance,
	deactivateUser,
	createCryptoAddress,
	getHmacToken,
	createHmacToken,
	deleteHmacToken,
	getUserStats,
	cancelWithdrawal
};
