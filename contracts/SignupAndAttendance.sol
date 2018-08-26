pragma solidity 0.4.24; //Protection in place: Solidity Pragma locked

// ****** Notes ******/
// Protections in place:
// 	- Solidity Pragma locked
// 	- Circuit Breaker - Emergency stop by Contract Creator
//
// Protections not implemented:
// 	- Rentrancy protection
// 	- Overflow protection
// 	- Underflow protection
// 	- Speed bumps
//
//
// Coding practices in place:
// 	- Explicitly marking visibility in functions and state variables
//	- Differentiating functions and events
//	- Keeping fallback functions simple
// ********************

contract Owned
{
    address private _owner;
    
    constructor() public
    {
        _owner = msg.sender;
    }
    
   modifier onlyOwner
   {
       require(msg.sender == _owner);
       _;
   }
}

contract SignupAndAttendance is Owned
{
	struct Student
	{
		bytes32 name;
		bytes32 email;
		string[] loginRecord;
		string[] signupRecord;
		string[] coursesCompletedRecord;
	}

	mapping (address => uint) public balances;
	mapping (address => Student) public students;

	address[] public studentAccounts;

	event StudentLoginEvent(string loginRecord);
	event SignupEvent(string courseData);
	event AttendanceTakingEvent(string courseData);

	event FallbackEvent(address _sender); //For the fallback function

	//****** Protections in place: Avoiding common attacks ******
		bool private _stopped = false; //For Circuit Breaker

		function toggleEmergencyStopStatus() onlyOwner public returns(bool success)
		{
		    _stopped = !_stopped; // Toggle the value of stopped
		    return _stopped;
		}

		// Emergency stop
		modifier stopInEmergency
		{
			require(!_stopped);
			_;
		}

		// Normal operation and emergency
		modifier onlyInEmergency
		{
			if (_stopped)
			_;
		}

		// Check if the status of the contract is active
		function checkActive() public view returns(bool stoppedstatus)
		{
			return _stopped;
		}
	//***********************************************************

	constructor() public 
	{

	}

	function StudentLogin(bytes32 _name, bytes32 _email, string _loginRecord) stopInEmergency public
	{
		var _address = msg.sender;
		Student storage student = students[_address];

		student.name = _name;
		student.email = _email;
		student.loginRecord.push(_loginRecord);

		studentAccounts.push(_address);

		emit StudentLoginEvent(_loginRecord);
	}

	function Signup(string _courseId, string _courseData) onlyOwner stopInEmergency payable public
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

	  	Student storage student = students[msg.sender];
		student.signupRecord.push(_courseData);

		emit SignupEvent(_courseData);

	  //Return the total number of courses signed up for by the attendee.
	  //return attendees[msg.sender].signups.push(courseId) - 1;
	}

	function AttendanceTaking(string _courseData) onlyOwner stopInEmergency public
	{
		Student storage student = students[msg.sender];
		student.coursesCompletedRecord.push(_courseData);

		emit AttendanceTakingEvent(_courseData);
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

   	//****** Fallback function
	function () public
	{
		emit FallbackEvent(msg.sender);
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