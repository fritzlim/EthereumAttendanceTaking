pragma solidity 0.4.24;

contract SignupAndAttendance
{
	struct Attendee
	{
		//bytes32 courseId;
		bytes32 name;
		string[] signups;
		string[] coursesCompleted;
	}

	mapping (address => uint) public balances;
	mapping (address => Attendee) public attendees;

	event CourseSignupSuccessful(string _courseId);

	constructor() public 
	{

	}

	function Signup(string _courseId) payable public
	{
		//require(courseId >= 0 && courseId <= 2);
		//bytes32 memory temp = "intro-to-blockchain";

		//bytes32 test = stringToBytes32(_courseId);
	  	
	  	if(compareStrings("intro-to-blockchain", _courseId))
	  	{
			require(msg.value == 0 ether);
			balances[msg.sender] += msg.value;
	  	}
	  	else
	  	{
	  		require(msg.value == 2 ether);
			balances[msg.sender] += msg.value;
	  	}

	  	Attendee storage attendee = attendees[msg.sender];
		attendee.signups.push(_courseId);

		emit CourseSignupSuccessful(_courseId);

	  //Return the total number of courses signed up for by the attendee.
	  //return attendees[msg.sender].signups.push(courseId) - 1;
	}

	function AttendanceTaking(string _courseCompletedId) view public
	{
		Attendee storage attendee = attendees[msg.sender];
		attendee.coursesCompleted.push(_courseCompletedId);
	}

	// function EmitCourseSignupSucessful(_courseId)
	// {
	// 	emit CourseSignupSucessful(_courseId);
	// }

	// function EtherToWei (uint _ether) view public returns (uint)
	// {
	// 	return _ether * 1000000000000000000;
	// }

	//****** Taken from https://ethereum.stackexchange.com/questions/30912/how-to-compare-strings-in-solidity
	function compareStrings (string a, string b) view public returns (bool)
	{
       return keccak256(a) == keccak256(b);
   	}
   	//******

	// //****** Taken from https://ethereum.stackexchange.com/questions/23549/convert-string-to-bytes32-in-web3j
	// function stringToBytes32 (string _string) view public
	// {
	//   byte[] storage byteValue = string.getBytes();
	//   byte[] storage byteValueLen32 = new byte[32];
	//   System.arraycopy(byteValue, 0, byteValueLen32, 0, byteValue.length);
	//   return new Bytes32(byteValueLen32);
	// }	
	// //******
}