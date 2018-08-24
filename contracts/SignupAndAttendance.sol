pragma solidity 0.4.24;

contract Owned
{
    address owner;
    
    constructor() public {
        owner = msg.sender;
    }
    
   modifier onlyOwner {
       require(msg.sender == owner);
       _;
   }
}

contract SignupAndAttendance is Owned
{
	struct Student
	{
		//bytes32 courseId;
		bytes32 name;
		bytes32 email;
		string[] signups;
		string[] coursesCompleted;
	}

	mapping (address => uint) public balances;
	mapping (address => Student) public students;

	address[] public studentAccounts;

	event StudentLoginSuccessful(bytes32 _name);
	event CourseSignupSuccessful(string _courseId);

	constructor() public 
	{

	}

	function StudentLogin(address _address, bytes32 _name, bytes32 _email) onlyOwner payable public
	{
		var student = students[_address];

		student.name = _name;
		student.email = _email;

		studentAccounts.push(_address);
		emit StudentLoginSuccessful(_name);
	}

	function Signup(string _courseId) onlyOwner payable public
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
		student.signups.push(_courseId);

		emit CourseSignupSuccessful(_courseId);

	  //Return the total number of courses signed up for by the attendee.
	  //return attendees[msg.sender].signups.push(courseId) - 1;
	}

	function AttendanceTaking(string _courseCompletedId) onlyOwner view public
	{
		Student storage student = students[msg.sender];
		student.coursesCompleted.push(_courseCompletedId);
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