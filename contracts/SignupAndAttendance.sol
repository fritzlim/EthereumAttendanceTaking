pragma solidity 0.4.24;

contract SignupAndAttendance
{
	struct Attendee
	{
		//bytes32 courseId;
		bytes32 name;
		bytes32[] signups; 
	}

	mapping (address => uint) public balances;
	mapping (address => Attendee) public attendees;

	function SignupAndAttendance() public 
	{

	}

	function Signup(bytes32 courseId) view public
	{
		//require(courseId >= 0 && courseId <= 2);
		bytes32 memory temp = "intro-to-blockchain";
	  	if(courseId == temp)
	  	{
			require(msg.value == 2 ether);
			balances[msg.sender] += msg.value;
	  	}

	  	Attendee storage attendee = attendees[msg.sender];
		attendee.signups.push(courseId);

	  //Return the total number of courses signed up for by the attendee.
	  //return attendees[msg.sender].signups.push(courseId) - 1;
	}
}