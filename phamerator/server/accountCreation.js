import { Random } from 'meteor/random';
import { Roles } from 'meteor/alanning:roles';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { SHA256 } from 'meteor/sha';
import { Email } from 'meteor/email';
import { check } from 'meteor/check';
import crypto from 'crypto';

Meteor.users.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});

Accounts.config({
  tokenSequenceLength: 32, // More secure for links
  loginTokenExpirationHours: 1
});

Accounts.registerLoginHandler('loginCode', async (options) => {
  if (!options.loginCode) return undefined;

  check(options, {
    loginCode: String,
    email: String
  });

  const email = options.email;
  const code = options.loginCode.trim();

  const user = await Meteor.users.findOneAsync({
    "emails.address": { $regex: new RegExp("^" + email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$", "i") }
  });

  if (!user) {
    throw new Meteor.Error(403, "User not found");
  }

  const loginCode = user.services?.loginCodes?.phamerator_v2_5;
  if (!loginCode || !loginCode.hashedCode || !loginCode.expiresAt) {
    throw new Meteor.Error(403, "No login code requested");
  }

  if (new Date() > loginCode.expiresAt) {
    await Meteor.users.updateAsync(
      { _id: user._id },
      { $unset: { "services.loginCodes.phamerator_v2_5": "" } }
    );
    throw new Meteor.Error(403, "Login code has expired");
  }

  if (loginCode.attempts >= 5) {
    await Meteor.users.updateAsync(
      { _id: user._id },
      { $unset: { "services.loginCodes.phamerator_v2_5": "" } }
    );
    throw new Meteor.Error(403, "Too many failed attempts. Code has been invalidated. Please request a new code.");
  }

  const hashedInput = SHA256(code);
  if (hashedInput !== loginCode.hashedCode) {
    const newAttempts = (loginCode.attempts || 0) + 1;
    if (newAttempts >= 5) {
      await Meteor.users.updateAsync(
        { _id: user._id },
        { $unset: { "services.loginCodes.phamerator_v2_5": "" } }
      );
      throw new Meteor.Error(403, "Too many failed attempts. Code has been invalidated. Please request a new code.");
    } else {
      await Meteor.users.updateAsync(
        { _id: user._id },
        { $set: { "services.loginCodes.phamerator_v2_5.attempts": newAttempts } }
      );
      const remaining = 5 - newAttempts;
      throw new Meteor.Error(403, `Invalid login code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`);
    }
  }

  // Clear code after successful verification so it can't be reused
  await Meteor.users.updateAsync(
    { _id: user._id },
    { $unset: { "services.loginCodes.phamerator_v2_5": "" } }
  );

  return {
    userId: user._id
  };
});

Meteor.methods({
  async sendLoginCode(email) {
    check(email, String);

    const normalizedEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      throw new Meteor.Error("invalid-email", "Please provide a valid email address.");
    }

    let user = await Meteor.users.findOneAsync({
      "emails.address": { $regex: new RegExp("^" + normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$", "i") }
    });

    if (!user) {
      // Create user if they don't exist
      const userId = await Accounts.insertUserDoc({}, {
        emails: [{ address: normalizedEmail, verified: false }]
      });
      user = await Meteor.users.findOneAsync(userId);
    }

    const existingCode = user.services?.loginCodes?.phamerator_v2_5;
    if (existingCode?.expiresAt && new Date() < existingCode.expiresAt) {
      const timeRemainingMs = existingCode.expiresAt.getTime() - Date.now();
      const codeAgeSeconds = (10 * 60 * 1000 - timeRemainingMs) / 1000;
      if (codeAgeSeconds < 60) {
        throw new Meteor.Error("too-many-requests", "Please wait a minute before requesting another code.");
      }
    }

    // Generate cryptographically secure 6-digit code
    const code = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save hashed code and expiration on the user object
    await Meteor.users.updateAsync(
      { _id: user._id },
      {
        $set: {
          "services.loginCodes.phamerator_v2_5": {
            hashedCode: SHA256(code),
            expiresAt: expiresAt,
            attempts: 0
          }
        }
      }
    );

    const isDev = Meteor.isDevelopment || process.env.NODE_ENV !== "production" || !process.env.MAIL_URL || process.env.MAIL_URL === "dummy";
    if (isDev) {
      console.log("\n=======================================================");
      console.log(`🔐 [AUTH DEV] Login Code for ${email}:`);
      console.log(`👉 ${code}`);
      console.log("=======================================================\n");
    } else {
      // Send the email
      await Email.sendAsync({
        to: email,
        from: 'Phamerator <no-reply@phamerator.org>',
        subject: 'Your Phamerator Login Code',
        text: `Hello!\n\nYour Phamerator login code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this code, you can safely ignore this email.\n\nThe Phamerator Team`
      });
    }

    return true;
  }
});

Accounts.urls.loginToken = function(email, sequence) {
  return Meteor.absoluteUrl('login/' + encodeURIComponent(email) + '/' + encodeURIComponent(sequence));
};

Accounts.emailTemplates.from = 'Phamerator <no-reply@phamerator.org>';
Accounts.emailTemplates.sendLoginToken = {
  subject() {
    return 'Your Phamerator Magic Link';
  },
  text(user, url) {
    return `Hello!\n\nClick the link below to securely sign in to Phamerator. No password is required.\n\n${url}\n\nIf you did not request this link, you can safely ignore this email.\n\nThe Phamerator Team`;
  }
};

const magicLinkCooldowns = new Map();

Meteor.startup(() => {
  const originalSendLoginTokenEmail = Accounts.sendLoginTokenEmail;
  if (typeof originalSendLoginTokenEmail === 'function') {
    Accounts.sendLoginTokenEmail = async function (arg1, arg2, arg3) {
      let user, email, sequence, url;

      if (typeof arg1 === 'object' && arg1 !== null && !arg1._id && (arg1.user || arg1.address || arg1.sequence || arg1.url)) {
        // accounts-passwordless object signature: { sequence, user, address, url, extraTokenData }
        user = arg1.user;
        email = arg1.address || arg1.email || user?.emails?.[0]?.address;
        sequence = arg1.sequence;
        url = arg1.url || (email && sequence ? Accounts.urls.loginToken(email, sequence) : null);
      } else {
        // Positional signature: (userIdOrUser, email, optionsOrUrl)
        const userIdOrUser = arg1;
        user = typeof userIdOrUser === 'object' ? userIdOrUser : (userIdOrUser ? await Meteor.users.findOneAsync(userIdOrUser) : null);
        email = arg2 || user?.emails?.[0]?.address;
        if (typeof arg3 === 'string') {
          url = arg3;
        } else if (typeof arg3 === 'object') {
          sequence = arg3?.sequence;
          url = email && sequence ? Accounts.urls.loginToken(email, sequence) : null;
        }
      }

      const normalizedEmail = (email || user?.emails?.[0]?.address || '').toLowerCase().trim();

      // 1. In-memory cooldown check (instant, reliable across requests)
      const now = Date.now();
      const memLast = magicLinkCooldowns.get(normalizedEmail);
      if (memLast && (now - memLast < 60000)) {
        const remainingSec = Math.ceil((60000 - (now - memLast)) / 1000);
        throw new Meteor.Error("too-many-requests", `Please wait ${remainingSec}s before requesting another login link.`);
      }

      // 2. Fresh database lookup for persistent cooldown
      const userId = user?._id;
      const freshUser = await Meteor.users.findOneAsync(
        userId ? { _id: userId } : { "emails.address": { $regex: new RegExp("^" + normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$", "i") } }
      );

      const dbLast = freshUser?.services?.magicLink?.lastSentAt;
      if (dbLast && (now - new Date(dbLast).getTime() < 60000)) {
        const remainingSec = Math.ceil((60000 - (now - new Date(dbLast).getTime())) / 1000);
        throw new Meteor.Error("too-many-requests", `Please wait ${remainingSec}s before requesting another login link.`);
      }

      // Record send time in memory and in DB
      if (normalizedEmail) {
        magicLinkCooldowns.set(normalizedEmail, now);
      }
      const targetId = freshUser?._id || userId;
      if (targetId) {
        await Meteor.users.updateAsync(
          { _id: targetId },
          { $set: { "services.magicLink.lastSentAt": new Date() } }
        );
      }

      const isDev = Meteor.isDevelopment || process.env.NODE_ENV !== "production" || !process.env.MAIL_URL || process.env.MAIL_URL === "dummy";
      if (isDev) {
        const resolvedEmail = email || user?.emails?.[0]?.address || 'unknown';
        const resolvedUrl = url || (resolvedEmail && sequence ? Accounts.urls.loginToken(resolvedEmail, sequence) : '');
        console.log("\n=======================================================");
        console.log(`🔐 [AUTH DEV] Magic Link for ${resolvedEmail}:`);
        console.log(`👉 ${resolvedUrl}`);
        console.log("=======================================================\n");
        return;
      }

      return originalSendLoginTokenEmail.apply(this, arguments);
    };
  }
});

Accounts.onCreateUser(async function (options, user) {
  // Assigns first and last names to the newly created user object
  if (!user._id) user._id = Random.id();

  user.newTermsAndPolicies = true;
  if (!user.name) {
    if (options.profile && options.profile.name) {
      user.name = options.profile.name;
    } else if (user.emails && user.emails.length > 0) {
      user.name = user.emails[0].address.split('@')[0];
    } else {
      user.name = 'Unknown';
    }
  }

  // Ensure the role exists using V4 API
  try {
    await Roles.createRoleAsync('view', { unlessExists: true });
  } catch (err) {
    if (err.code !== 11000) console.warn("Role creation warning:", err.message);
  }
  // Assign default roles using V4 API
  await Roles.addUsersToRolesAsync(user._id, ['view'], 'Actino_Draft');

  user.preferredDataset = 'Actino_Draft'
  user.profile = options.profile || {};
  user.GenesDB_assigned_genomes = [];
  user.selectedData = {
    "Actino_Draft": {
      "genomeMaps": []
    }
  }

  return user;
});
