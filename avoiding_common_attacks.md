## Protections in Place

#### Solidity Pragma locked
- Ensure that the contract can be compiled.

#### Circuit Breaker
- Emergency stop by Contract Creator
******

## Protections Not Implemented

#### Rentrancy protection
- Complete all internal calculations and transfers before .transfer()

#### Overflow protection
- Prevents transactions from taking place if uint balances overflows

#### Underflow protection
- Similar to Overflow

#### Speed bumps
- Delaying contract actions

See https://github.com/ethereum/wiki/wiki/Safety for more details.
