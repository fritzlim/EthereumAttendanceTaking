var Adoption = artifacts.require("Adoption");
var Owned = artifacts.require("Owned");
var SignupAndAttendance = artifacts.require('SignupAndAttendance');

// module.exports = function(deployer) {
//   deployer.deploy(Adoption);
// };

// module.exports = function(deployer) {
//   deployer.deploy(Adoption);
// };

module.exports = function(deployer) {
	deployer.deploy(Adoption);
  	deployer.deploy(Owned);	
  	deployer.deploy(SignupAndAttendance);
};