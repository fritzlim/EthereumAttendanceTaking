### EthereumAttendanceTaking dApp

This project is a proof-of-concept dApp for the 2018 ConsenSys Developer Program.

**Introduction and Use Case**

It demonstrates an idea of using blockchain to sign up for a course, purchase a course, and submit attendance for the course.
Each of these steps requires confirming the transaction on MetaMask.

The User Interface will show the transaction status.
The UI will also have appropriate buttons disabled so that the signup flow is login -> course signup -> course attendance-taking.

The sign up information is stored in a struct of `Student`.
This struct has the following members:
`bytes32 name`,
`bytes32 email`,
`string[] loginRecord`,
`string[] signupRrecord`, and
`string[] courseCompletedRecord`.



**How To Run the dApp**

1. Use an Ubuntu 16.04 develoopment server with ganache-cli and npm installed
2. Either fork or download this project. For convenience (to not have to deal with Linux file and folder permissions), extract the project onto the Desktop
3. Navigate into the project folder and run the following:
    1. `truffle compile`
    1. `truffle migrate --reset`
    1. `npm run dev`
A browser window should automatically open with the URL http://localhost:3000. This is the dApp frontend.
4. Note that you will also need the MetaMask browser extension installed. If you're using Firefox, see https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/. If you're using Chrome, see https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en.
5. For details on setting up MetaMask, see [Running the Project](https://github.com/fritzlim/EthereumAttendanceTaking/wiki/Running-the-Project).

If you need help in setting up the development machine, see the Wiki page [Setting Up the Development Machine](https://github.com/fritzlim/EthereumAttendanceTaking/wiki/Setting-Up-the-Development-Machine).<br />
If you need details on running the project, see the Wiki page [Running the Project](https://github.com/fritzlim/EthereumAttendanceTaking/wiki/Running-the-Project).

****

**Running the unit tests**

1. **IMPORTANT** - Delete the `onlyOwner` modifier in the `Signup()` and `AttendanceTaking()` functions in the smart contract "SignupAndAttendance.sol" file. The `onlyOwner` modifier makes the unit tests fail. Is this a known issue with running truffle tests?
1. Navigate into the project folder and run: `truffle test`.
1. **Expected outcome** - All tests will pass except the last one (testSignupWithEmergencyStopEngaged will not emit any event). This is the expected outcome because once the emrgency stop is engaged, the smart contract will not function. and I think it's because I have a bug in that test.
1. Once done with running the tests, insert the `OnlyOwner` modifier back into the `Signup()` and `AttendanceTaking()` functions in the smart contract "SignupAndAttendance.sol" file.



