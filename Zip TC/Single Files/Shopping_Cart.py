class ShoppingCart:
    def __init__(self, owner_name):
        self.owner = owner_name
        self.items = {}  # Stores item_name: price
        self.quantities = {} # Stores item_name: quantity
        self.discount_code = None

    def add_item(self, item_name, price, quantity=1):
        """
        Adds an item to the cart. Updates quantity if it already exists.
        """
        if price < 0:
            raise ValueError("Price cannot be negative.")
        if quantity <= 0:
            raise ValueError("Quantity must be at least 1.")
        
        # Just update the price if it changed
        self.items[item_name] = float(price)
        
        # Check if we already have this item to update count
        if item_name in self.quantities:
            self.quantities[item_name] += quantity
        else:
            self.quantities[item_name] = quantity

    def remove_item(self, item_name):
        """
        Removes an item entirely from the cart.
        """
        if item_name in self.items:
            del self.items[item_name]
            del self.quantities[item_name]
        else:
            raise KeyError(f"Item '{item_name}' not found in cart.")

    def apply_coupon(self, code):
        """
        Simple logic to apply a coupon code.
        """
        valid_coupons = ["SAVE10", "SUMMER20"]
        if code in valid_coupons:
            self.discount_code = code
            return True
        else:
            return False

    def calculate_total(self):
        """
        Calculates total cost, applying discounts if valid.
        """
        total = 0.0
        
        # Loop through items and multiply price by quantity
        for name, price in self.items.items():
            qty = self.quantities[name]
            total += price * qty
            
        # Apply discount logic
        if self.discount_code == "SAVE10":
            total = total * 0.90  # 10% off
        elif self.discount_code == "SUMMER20":
            total = total * 0.80  # 20% off
            
        return round(total, 2)

    def get_item_count(self):
        # Helper to just get total number of items
        return sum(self.quantities.values())