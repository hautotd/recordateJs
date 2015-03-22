/*!
 * APN Agent - Scenario Connection Header
 * @see
 */

/*
// uncomment section to enable debug output
process.env.DEBUG = process.env.DEBUG
  ? process.env.DEBUG + ',apnagent:*'
  : 'apnagent:*';
*/

/*!
 * Locate your certificate
 */

var join = require('path').join
//  , pfx = join(__dirname, '../_certs/recorDateCertificats.p12');
  , pfx = join(__dirname, '../_certs/Certificats.p12');

//var certt = join(__dirname, '../_certs/newrecordateCert.pem');
var certt = join(__dirname, '../_certs/Certificats.cer');
//var keyy = join(__dirname, '../_certs/newrecordate.pem');
var keyy = join(__dirname, '../_certs/prodkey.pem');
/*!
 * Create a new gateway agent
 */

var apnagent = require('apnagent')
  , agent = module.exports = new apnagent.Agent();

/*!
 * Configure agent
 */

agent
  .set('pfx file', pfx)
  .set('passphrase', '')
//.set('cert file', certt)
//.set('key file', keyy)  
//.set('passphrase', 'newrecordate')
//.enable('sandbox');

/*!
 * Error Mitigation
 */

agent.on('message:error', function (err, msg) {
  switch (err.name) {
    // This error occurs when Apple reports an issue parsing the message.
    case 'GatewayNotificationError':
      console.log('[message:error] GatewayNotificationError: %s', err.message);

      // The err.code is the number that Apple reports.
      // Example: 8 means the token supplied is invalid or not subscribed
      // to notifications for your application.
      if (err.code === 8) {
        console.log('    > %s', msg.device().toString());
        // In production you should flag this token as invalid and not
        // send any futher messages to it until you confirm validity
      }

      break;

    // This happens when apnagent has a problem encoding the message for transfer
    case 'SerializationError':
      console.log('[message:error] SerializationError: %s', err.message);
      break;

    // unlikely, but could occur if trying to send over a dead socket
    default:
      console.log('[message:error] other error: %s', err.message);
      break;
  }
});

/*!
 * Make the connection
 */

agent.connect(function (err) {
  // gracefully handle auth problems
  if (err && err.name === 'GatewayAuthorizationError') {
    console.log('Authentication Error: %s', err.message);
    process.exit(1);
  }

  // handle any other err (not likely)
  else if (err) {
    throw err;
  }

  // it worked!
  var env = agent.enabled('sandbox')
    ? 'sandbox'
    : 'production';

  console.log('apnagent [%s] gateway connected', env);
});
