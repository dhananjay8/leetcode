def find_gcd(a, b):
    """
    Function to find the greatest common divisor (GCD) of two numbers.
    """
    while b:
        a, b = b, a % b
    return a

def find_lcm(a, b):
    """
    Function to find the least common multiple (LCM) of two numbers.
    """
    return abs(a * b) // find_gcd(a, b)

# Example usage:
num1 = 12
num2 = 18
print("GCD of", num1, "and", num2, ":", find_gcd(num1, num2))  # Output: 6
print("LCM of", num1, "and", num2, ":", find_lcm(num1, num2))  # Output: 36
