pragma solidity 0.4.24; //Protection in place: Solidity Pragma locked

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/SignupAndAttendance.sol";

contract TestSignupAndAttendance {
  	SignupAndAttendance signupAndAttendance = SignupAndAttendance(DeployedAddresses.SignupAndAttendance());

	// Testing the StudentLogin() function.
	// This tests whether the student login information has been written correctly into the loginRecord array.
	function testStudentLoginReturnValue() public {
		string memory expected = "Tue Aug 28 2018 08:54:12 GMT+0800(+08):Fritz Lim,me@mymail.com";
		string memory returnedLoginRecord = signupAndAttendance.StudentLogin("Fritz Lim", "me@mymail.com", "Tue Aug 28 2018 08:54:12 GMT+0800(+08):Fritz Lim,me@mymail.com");

	  	Assert.equal(returnedLoginRecord, expected, "[testStudentLoginReturnValue()] The loginRecord value is correct.");
	}

	// Testing retrieval of a single student's address.
	// This tests whether the student's address has been written correctly into the studentAccounts array.
	function testGetStudentAccountsByArrayIndex() public {
	  // Expected owner is this contract
	  address expected = this;
	  address[] memory studentAddress = signupAndAttendance.GetStudentAccounts();

	  Assert.equal(studentAddress[0], expected, "[testGetStudentAccountsByArrayIndex] Address of the 0th student is correct.");
	}

	// Testing retrieval of the latest signup record.
	// This tests whether the record has been written correctly into the signupRecord array.
	function testSignupReturnValue() public {
	  	string memory expected = "Tue Aug 28 2018 08:54:12 GMT+0800(+08):intro-to-blockchain";
	  	string memory returnedSignupRecord = signupAndAttendance.Signup("intro-to-blockchain", "Tue Aug 28 2018 08:54:12 GMT+0800(+08):intro-to-blockchain");

	  	Assert.equal(returnedSignupRecord, expected, "[testGetSignupRecordFromSginupRecordArray()] The signupRecord value is correct.");
	}

	// Test for attendance-taking.
	// This tests whether the attendance record is correctly written into the coursesCompletedRecord array.
	function testAttendanceTaking() public {
		string memory expected = "Tue Aug 28 2018 08:54:12 GMT+0800(+08):intro-to-blockchain";
	  	string memory returnedCoursesCompletedRecord = signupAndAttendance.AttendanceTaking("Tue Aug 28 2018 08:54:12 GMT+0800(+08):intro-to-blockchain");
		
		Assert.equal(returnedCoursesCompletedRecord, expected, "[testAttendanceTaking()] The coursesCompletedRecord value is correct.");
	}

	// Test for toggling the emergency stop.
	// This tests whether the emergency stop is correctly toggled.
	function testToggleEmergencyStopStatus() public {
		bool returnedStopStatus = signupAndAttendance.ToggleEmergencyStopStatus();
		bool expected = true;

	  Assert.equal(returnedStopStatus, expected, "[testToggleEmergencyStopStatus()] Emergency stop successfully toggled.");
	}

	// Test for engaging the emergency stop.
	// This tests whether the emergency stop is correctly engaged by attempting to sign up for a course after engaging the emergency stop.
	function testSignupWithEmergencyStopEngaged() public{
		string memory expectedWhenEmergencyStopIsNotEngaged = "Tue Aug 28 2018 08:54:12 GMT+0800(+08):solidity-101";
	  	string memory returnedSignupRecordWhenEmergencyStopIsNotEngaged = signupAndAttendance.Signup("solidity-101", "Tue Aug 28 2018 08:54:12 GMT+0800(+08):solidity-101");

	  Assert.equal(returnedSignupRecordWhenEmergencyStopIsNotEngaged, expectedWhenEmergencyStopIsNotEngaged, "[testSignupWithEmergencyStopEngaged()] Problem with activating emergency stop.");
	}
}