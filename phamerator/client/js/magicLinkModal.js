import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Meteor } from 'meteor/meteor';

Template.magicLinkModal.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    codeSent: false,
    email: '',
    isSending: false,
    codeCooldown: 0,
    magicCooldown: 0
  });

  const template = this;
  this.cooldownInterval = Meteor.setInterval(() => {
    const currentCodeCd = template.state.get('codeCooldown') || 0;
    if (currentCodeCd > 0) {
      template.state.set('codeCooldown', currentCodeCd - 1);
    }
    const currentMagicCd = template.state.get('magicCooldown') || 0;
    if (currentMagicCd > 0) {
      template.state.set('magicCooldown', currentMagicCd - 1);
    }
  }, 1000);
});

Template.magicLinkModal.onDestroyed(function () {
  if (this.cooldownInterval) {
    Meteor.clearInterval(this.cooldownInterval);
  }
});

Template.magicLinkModal.onRendered(function () {
  const template = this;
  const modalEl = document.getElementById('magicLinkModal');
  if (modalEl) {
    modalEl.addEventListener('hidden.bs.modal', function () {
      template.state.set('codeSent', false);
      template.state.set('email', '');
      template.state.set('isSending', false);
    });
  }
});

Template.magicLinkModal.helpers({
  codeSent() {
    return Template.instance().state.get('codeSent');
  },
  email() {
    return Template.instance().state.get('email');
  },
  isSending() {
    return Template.instance().state.get('isSending');
  },
  codeCooldown() {
    return Template.instance().state.get('codeCooldown');
  },
  magicCooldown() {
    return Template.instance().state.get('magicCooldown');
  }
});

function doSendLoginCode(email, template) {
  if (!email) {
    M.toast({ html: 'Please enter a valid email address.', classes: 'red' });
    return;
  }
  if (template.state.get('codeCooldown') > 0) return;

  template.state.set('isSending', true);
  M.toast({ html: 'Sending login code...' });

  Meteor.call('sendLoginCode', email, (err) => {
    template.state.set('isSending', false);
    if (err) {
      M.toast({ html: `Error: ${err.reason || 'Could not send code.'}`, classes: 'red' });
    } else {
      M.toast({ html: 'Check your email for the login code!', classes: 'green' });
      template.state.set('email', email);
      template.state.set('codeSent', true);
      template.state.set('codeCooldown', 60);
    }
  });
}

Template.magicLinkModal.events({
  'submit #magic-link-form': function (event, template) {
    event.preventDefault();
    const email = event.target.magic_email.value;
    doSendLoginCode(email, template);
  },

  'click #btn-resend-code': function (event, template) {
    event.preventDefault();
    const email = template.state.get('email');
    doSendLoginCode(email, template);
  },

  'click #btn-change-email': function (event, template) {
    event.preventDefault();
    template.state.set('codeSent', false);
  },

  'click #btn-magic-link': function (event, template) {
    event.preventDefault();
    const email = template.find('#magic_email')?.value;

    if (!email) {
      M.toast({ html: 'Please enter a valid email address.', classes: 'red' });
      return;
    }

    if (template.state.get('magicCooldown') > 0) return;

    template.state.set('isSending', true);
    M.toast({ html: 'Sending magic link...' });
    
    Accounts.requestLoginTokenForUser({ selector: email }, (err) => {
      template.state.set('isSending', false);
      if (err) {
        if (err.reason === 'User not found' || err.error === 403) {
          M.toast({ html: 'No account found with this email. Please click "Email Login Code" to sign in or create an account.', classes: 'red', displayLength: 6000 });
        } else {
          M.toast({ html: `Error: ${err.reason || 'Could not send link.'}`, classes: 'red' });
        }
      } else {
        template.state.set('magicCooldown', 60);
        M.toast({ html: 'Check your email for the login link!', classes: 'green', displayLength: 6000 });
        
        // Close the modal and clear the form
        if (typeof bootstrap !== 'undefined') {
          var modalInstance = bootstrap.Modal.getInstance(document.getElementById('magicLinkModal'));
          if (modalInstance) {
            modalInstance.hide();
          }
        }
        template.find('#magic-link-form')?.reset();
      }
    });
  },

  'submit #verify-code-form': function (event, template) {
    event.preventDefault();
    const email = template.state.get('email');
    const code = event.target.verify_code.value;

    if (email && code) {
      template.state.set('isSending', true);
      M.toast({ html: 'Verifying code...' });

      Accounts.callLoginMethod({
        methodArguments: [{ loginCode: code, email: email }],
        userCallback: (err) => {
          template.state.set('isSending', false);
          if (err) {
            M.toast({ html: `Error: ${err.reason || 'Invalid code.'}`, classes: 'red' });
          } else {
            M.toast({ html: 'Successfully signed in!', classes: 'green' });
            
            // Close the modal and clear the form state
            if (typeof bootstrap !== 'undefined') {
              var modalInstance = bootstrap.Modal.getInstance(document.getElementById('magicLinkModal'));
              if (modalInstance) {
                modalInstance.hide();
              }
            }
            template.state.set('codeSent', false);
            template.state.set('email', '');
          }
        }
      });
    }
  }
});

Template.nav.events({
  'click .logout-btn': function (event) {
    event.preventDefault();
    Meteor.logout(function(err) {
      if (err) {
        console.error("Logout failed", err);
      } else {
        M.toast({ html: 'Successfully logged out', classes: 'green' });
      }
    });
  }
});
