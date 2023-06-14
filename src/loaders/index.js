const StartServerUDP = require('./serverTCP');
class Loaders {
  start (){
    StartServerUDP();
  }
}
module.exports = new Loaders (); 

