export const CLIENT_INFO_COMMANDS = `
Commands: 
  select <product> [qty]
    Select product to add to current session
    Ex: "select Coke" or "select Coke 2"
  remove <product> [qty]
    Remove product from current session
    Ex: "remove Coke" or. "remove Coke 2"
  pay <cash> [qty]
    Start payment / Add to current payment / Finish payment
    If the amount needed is exactly the sum needed or it exceeds and the
    vending machine has the necessary cash to give change -> finish the payment
  cancel-payment
    Cancels payment in progress
  cancel
    Cancels payment in progress and all selected products
  restore
    Restores inventory and wallet to initial value
  state
    Gives information about the current inventory and session
  info
    Returns info about commands
  login <password>
    Login as supplier
  exit 
    Exit vending machine
`;

export const SUPPLIER_INFO_COMMANDS = `
Commands: 
  restore
    Restores inventory and wallet to initial value
  state
    Gives information about the current inventory and updates needed
  logout
    Logout from supplier action menu
`;
