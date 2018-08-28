The following design pattern and decisions were taken into consideration:

#### Fail early and fail loud
- I used `require()` for the payable functions to ensure that a specific amount of Ether is transacted.

#### Function modifiers
- I made the decision to use a modifier to ensure that the person who logged in is the only one who can use the dApp.

#### Address registry
- I used mappings to access the account balance and a struct by specifiying an address.

#### Minimising transaction cost
- I declared variables as `bytes32` instead of `string` whenever possible.
- However, `string[]` was used for certain variables. This can lead to high transaction costs because the array can grow to an uncontrolled size.
