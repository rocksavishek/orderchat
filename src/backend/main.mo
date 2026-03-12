import Array "mo:core/Array";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile type and storage
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Order management types and data
  module OrderModule {
    public type Status = {
      #pending;
      #completed;
      #cancelled;
    };

    public func compareByCreatedAt(order1 : Order, order2 : Order) : Order.Order {
      Int.compare(order2.createdAt, order1.createdAt);
    };
  };

  public type Order = {
    id : Nat;
    customerName : Text;
    product : Text;
    quantity : Nat;
    deliveryDate : Text;
    price : Float;
    paymentStatus : Text;
    deliveryStatus : Text;
    createdAt : Int;
  };

  let orders = Map.empty<Nat, Order>();
  var nextOrderId = 1;

  public shared ({ caller }) func createOrder(
    customerName : Text,
    product : Text,
    quantity : Nat,
    deliveryDate : Text,
    price : Float,
    paymentStatus : Text,
    deliveryStatus : Text,
  ) : async Order {
    // Users can create orders
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };

    let newOrder : Order = {
      id = nextOrderId;
      customerName;
      product;
      quantity;
      deliveryDate;
      price;
      paymentStatus;
      deliveryStatus;
      createdAt = Int.abs(nextOrderId);
    };

    orders.add(nextOrderId, newOrder);
    nextOrderId += 1;
    newOrder;
  };

  public query ({ caller }) func getOrders() : async [Order] {
    // Users can view orders
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    orders.values().toArray().sort(OrderModule.compareByCreatedAt);
  };

  public shared ({ caller }) func updatePaymentStatus(id : Nat, status : Text) : async () {
    // Admin-only: payment status is sensitive financial data
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update payment status");
    };

    let order = fetchOrder(id);
    let updatedOrder = { order with paymentStatus = status };
    orders.add(id, updatedOrder);
  };

  public shared ({ caller }) func updateDeliveryStatus(id : Nat, status : Text) : async () {
    // Admin-only: delivery status requires operational control
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update delivery status");
    };

    let order = fetchOrder(id);
    let updatedOrder = { order with deliveryStatus = status };
    orders.add(id, updatedOrder);
  };

  public shared ({ caller }) func deleteOrder(id : Nat) : async () {
    // Admin-only: deletion is a destructive operation
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete orders");
    };

    orders.remove(id);
  };

  func fetchOrder(id : Nat) : Order {
    switch (orders.get(id)) {
      case (null) {
        Runtime.trap("Order with given ID does not exist.");
      };
      case (?order) { order };
    };
  };
};
