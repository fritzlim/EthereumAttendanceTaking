#### Function modifiers
- I made the decision to use a modifier to ensure that the person who logged in is the only one who can use the dApp.

#### Address registry
- I used mappings to access the account balance and a struct by specifiying an address.

#### Minimising transaction cost
- I declared variables as `bytes32` instead of `string` whenever possible.
