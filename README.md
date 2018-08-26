### EthereumAttendanceTaking dApp

This project is a dApp for the 2018 ConsenSys Developer Program.

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
2. Either fork or download this project
3. Navigate into the project folder and run the following:
`truffle compile`
`truffle migrate --reset`
`npm run dev`
A browser window should automatically open with the URL http://localhost:3000.
4. Note that you will also need the MetaMask browser extension installed. If you're using Firefox, see https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/. If you're using Chrome, see https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en.

If you need help in setting up the development machine, see the Wiki https://github.com/fritzlim/EthereumAttendanceTaking/wiki/Setting-Up-the-Development-Machine and https://github.com/fritzlim/EthereumAttendanceTaking/wiki/Running-the-Project.




