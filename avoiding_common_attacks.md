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

#### Limiting the length of strings
- So that it's unlikely that operations will encounter an out of gas situation

*****


## Coding practices in place:

#### Explicitly marking visibility in functions and state variables
- So that it's clear what the visibility is meant to be

#### Differentiating functions and events
- To help prevent calling the wrong thing in code, which prevents bugs

#### Keeping fallback functions simple
- To limit the work of these functions because they only have access to 2,300 gas

****
See https://github.com/ethereum/wiki/wiki/Safety for more details on avoiding common atacks.
