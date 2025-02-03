import pandas as pd
import random
from faker import Faker

# Initialize Faker for random data generation
fake = Faker()

# Sample templates for UPI and non-UPI messages
upi_templates = [
    "Dear Customer, A/C XX{acc} debited by INR {amt}.00 on {date}. Trf to VPA {vpa}. Ref No {ref}. Not you? Call {bank_num} -{bank}",
    "Your a/c XXXXX{acc} credited INR {amt}.00 by UPI REF NO {ref} on {date}. Bal: INR {bal} -{bank}",
    "UPI: INR {amt}.00 paid to {name} (UPI Ref {ref}). Not you? Block txn: {link} -{bank}",
    "Received Rs.{amt}.00 from VPA {vpa} UPI Ref {ref}. Current balance: Rs.{bal} -{bank}",
    "Alert: Acct XXX{acc} debited Rs.{amt}.00 on {date} to {merchant}. Call {bank_num} if unrecognized -{bank}",
    "UPI payment of ₹{amt}.00 to {merchant} (UPI Ref {ref}) successful. Avl Bal: ₹{bal} -{bank}",
    "Your {bank} a/c {acc} debited ₹{amt}.00 on {date}. UPI txn to VPA {vpa}. Dispute: {bank_num}",
    "Money sent: ₹{amt}.00 to VPA {vpa} UPI Ref {ref}. Current balance: ₹{bal} -{bank}",
    "UPI AutoPay: ₹{amt}.00 deducted for {service} SUBSCRPTN Ref {ref}. Next due {due_date} -{bank}",
    "Your {bank} a/c {acc} credited ₹{amt}.00 (UPI Ref {ref}) from VPA {vpa}. Bal: ₹{bal}",
]

non_upi_templates = [
    "Your OTP for {service} login is {otp}. Valid for 10 mins. Do not share with anyone.",
    "{promo}: Get {discount}% off on {category}. Shop now: {link}",
    "Google Alert: New login detected from {city} on {device}. Approve? Reply Y/N",
    "{network}: Your bill of ₹{amt} due on {date}. Pay now: {link} to avoid disconnection",
    "{friend} added you on {social}! View profile: {link}",
    "{food}: Your order #{ref} has been delivered. Rate your experience: {link}",
    "Job Alert: {company} hiring freshers! CTC {ctc}LPA. Apply by {date}: {link}",
    "IRCTC: WL{wl} for {train_no} {route} Exp has been CONFIRMED. Charting at {time} hrs",
    "Your {service} subscription will renew on {date} for ₹{amt}. Manage account: {link}",
    "Loan approved! Get ₹{loan_amt} personal loan at {interest}% interest. Call {phone} -{bank} Loans",  # Fixed loan_amt placeholder
]

# Data for placeholders
names = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Ishaan", "Ayaan", "Reyansh", "Krishna", "Dhruv", "Saanvi", "Ananya", "Ira", "Aadhya", "Diya", "Mira", "Riya", "Pooja", "Neha"]
banks = ["SBI", "HDFC", "ICICI", "Kotak", "Axis", "Yes Bank", "PNB", "IDFC FIRST", "IndusInd"]
merchants = ["AmazonPay.UPI", "Zomato", "Swiggy", "JioFiber", "Netflix", "Electricity.UPI", "PhonePe"]
services = ["Netflix", "Hotstar", "Amazon Prime", "Spotify", "YouTube Premium"]
vpns = ["mobile@upi", "rajesh@okicici", "salary@hdfc", "electricity@upi", "zomato@upi"]
cities = ["Mumbai", "Delhi", "Chennai", "Kolkata", "Bangalore", "Hyderabad"]
devices = ["Chrome Windows", "Safari Mac", "Edge Windows", "Firefox Linux"]
promos = ["Flipkart Big Billion Days", "Amazon Great Indian Sale", "Myntra End of Season Sale"]
categories = ["smartphones", "fashion", "electronics", "furniture", "grocery"]
socials = ["Facebook", "Instagram", "LinkedIn", "Snapchat"]
food_services = ["Zomato", "Swiggy", "Dominos", "McDonald's"]
companies = ["Wipro", "TCS", "Infosys", "Google", "Microsoft", "Amazon"]
trains = ["12564", "12685", "12792", "12834", "12956"]
routes = ["NZM-CBE", "SBC-MAS", "DLI-PNBE", "CSTM-LKO", "BBS-HWH"]
loan_amounts = [50000, 100000, 200000, 500000]
interest_rates = [10.9, 12.5, 8.75, 9.99]

# Generate 4000 messages (2000 UPI, 2000 Non-UPI)
upi_messages = [
    random.choice(upi_templates).format(
        acc=random.randint(1000, 9999),
        amt=random.randint(10, 50000),
        date=f"{random.randint(1, 28)}-{random.choice(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])}-25",
        vpa=random.choice(vpns),
        ref=random.randint(100000, 999999),
        bank_num=random.randint(1800000000, 1800999999),
        bank=random.choice(banks),
        bal=random.randint(1000, 100000),
        merchant=random.choice(merchants),
        service=random.choice(services),
        due_date=f"{random.randint(1, 28)}-Apr-25",
        name=random.choice(names),
        link=f"https://short.url/{random.randint(10000, 99999)}"
    )
    for _ in range(2000)
]

non_upi_messages = [
    random.choice(non_upi_templates).format(
        service=random.choice(services),
        otp=random.randint(100000, 999999),
        promo=random.choice(promos),
        discount=random.randint(10, 80),
        category=random.choice(categories),
        link=f"https://short.url/{random.randint(10000, 99999)}",
        city=random.choice(cities),
        device=random.choice(devices),
        network=random.choice(["Airtel", "Jio", "BSNL", "Vodafone Idea"]),
        amt=random.randint(100, 1000),
        friend=random.choice(names),
        social=random.choice(socials),
        food=random.choice(food_services),
        ref=random.randint(100000, 999999),
        company=random.choice(companies),
        ctc=random.randint(3, 12),
        train_no=random.choice(trains),
        route=random.choice(routes),
        wl=random.randint(1, 20),
        time=f"{random.randint(10, 23)}:{random.randint(10, 59)}",
        date=f"{random.randint(1, 28)}-{random.choice(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])}-25",
        phone=fake.phone_number(),
        interest=random.choice(interest_rates),
        bank=random.choice(banks),
        loan_amt=random.choice(loan_amounts)
    )
    for _ in range(2000)
]

# Combine UPI and Non-UPI messages into a single dataset
messages = upi_messages + non_upi_messages
labels = [1] * 2000 + [0] * 2000  # 1 for UPI, 0 for Non-UPI

# Create DataFrame
df = pd.DataFrame({"message": messages, "label": labels})

# Shuffle the dataset
df = df.sample(frac=1, random_state=42).reset_index(drop=True)

# Save to CSV
df.to_csv("upi_dataset.csv", index=False)

print("Dataset generated successfully! Saved as 'upi_dataset.csv'.")