import pandas as pd
import random
from faker import Faker

class UPIDatasetGenerator:
    def __init__(self):
        self.fake = Faker('en_IN')  # Indian locale for more realistic data
        
        # Comprehensive lists for diverse data generation
        self.senders = [
            'SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Yes Bank', 
            'Kotak Mahindra Bank', 'Punjab National Bank', 
            'Personal', 'Family', 'Friend'
        ]
        
        self.merchants = [
            'Amazon', 'Flipkart', 'Zomato', 'Swiggy', 'Paytm', 
            'PhonePe', 'Netflix', 'Ola', 'Uber', 'BigBasket', 
            'Myntra', 'BookMyShow', 'Google Play Store'
        ]
        
        self.transaction_types = ['credit', 'debit']
        
    def generate_upi_message(self):
        """Generate a synthetic UPI message with multiple variations"""
        sender = random.choice(self.senders)
        merchant = random.choice(self.merchants)
        transaction_type = random.choice(self.transaction_types)
        
        # Amount generation with realistic ranges
        if transaction_type == 'debit':
            amount = round(random.uniform(10, 5000), 2)
        else:
            amount = round(random.uniform(100, 10000), 2)
        
        # Reference number generation
        ref_number = random.randint(100000, 999999)
        
        # Date generation
        date = self.fake.date_this_year()
        
        # Message templates with variations
        templates = [
            "{sender}: {transaction} of ₹{amount:.2f} to {merchant}. Ref No {ref_number} on {date}",
            "{sender}: A/C {transaction} ₹{amount:.2f} via UPI to {merchant}. Reference {ref_number}",
            "UPI Transaction: {amount:.2f} {transaction} from {sender} to {merchant}. Ref {ref_number}",
            "{sender} Bank: {transaction_cap} of ₹{amount:.2f}. Transaction with {merchant}. Ref: {ref_number}"
        ]
        
        template = random.choice(templates)
        message = template.format(
            sender=sender,
            transaction=transaction_type,
            transaction_cap=transaction_type.capitalize(),
            amount=amount,
            merchant=merchant,
            ref_number=ref_number,
            date=date
        )
        
        return {
            'message': message,
            'sender': sender,
            'merchant': merchant,
            'amount': amount,
            'transaction_type': transaction_type,
            'reference_number': ref_number,
            'date': date
        }
    
    def generate_dataset(self, num_samples=5000):
        """Generate a comprehensive UPI message dataset"""
        data = [self.generate_upi_message() for _ in range(num_samples)]
        df = pd.DataFrame(data)
        
        # Optional: Add noise or variations
        df = self.add_dataset_variations(df)
        
        return df
    
    def add_dataset_variations(self, df):
        """Add slight variations to increase dataset robustness"""
        # Add some random spelling variations or typos
        def add_typos(text):
            typo_prob = 0.1
            if random.random() < typo_prob:
                text = text.replace('UPI', 'UPi')
            return text
        
        df['message'] = df['message'].apply(add_typos)
        
        return df
    
    def save_dataset(self, df, filename='upi_extraction.csv'):
        """Save dataset to CSV"""
        df.to_csv(filename, index=False)
        print(f"Dataset saved to {filename}")
        
        # Additional dataset insights
        print("\nDataset Statistics:")
        print(df['sender'].value_counts())
        print("\nMerchant Distribution:")
        print(df['merchant'].value_counts())
        print("\nTransaction Type Distribution:")
        print(df['transaction_type'].value_counts())

# Generate and save dataset
generator = UPIDatasetGenerator()
upi_dataset = generator.generate_dataset(num_samples=10000)
generator.save_dataset(upi_dataset)

# Sample dataset preview
print("\nDataset Preview:")
print(upi_dataset.head())