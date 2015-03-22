/*!
 * Dependencies
 */

var agent = require('./_header')
  , device = require('../device');

/*!
 * Send message
 */

agent.createMessage()
  .device("<acc929df 77f116c5 2a608935 e871139e 32692856 d77734a6 446b9ed4 455ddbc1>")
  .alert('Farid: Une francaise notée 9/10. Lieux AEROPORT OCTEVILLE')
.badge(3)
  .send();
