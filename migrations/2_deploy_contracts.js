var Adoption = artifacts.require("Adoption");
var SignupAndAttendance = artifacts.require('SignupAndAttendance');

module.exports = function(deployer) {
  deployer.deploy(Adoption);
};

module.exports = function(deployer) {
  deployer.deploy(SignupAndAttendance);
};