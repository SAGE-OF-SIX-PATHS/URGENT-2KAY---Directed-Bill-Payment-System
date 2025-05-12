import { ethers } from 'ethers';
import {
  BILL_PAYMENT_SYSTEM_ABI,
  BILL_PAYMENT_SYSTEM_ADDRESS,
  RPC_PROVIDER_URL,
  U2K_TOKEN_ABI,
  U2K_TOKEN_ADDRESS
} from '../config/web3';

// Status enum that matches the contract
enum BillStatus {
  PENDING = 0,
  APPROVED = 1,
  PAID = 2,
  REJECTED = 3
}

// Interfaces for Web3 bill types
export interface Web3Bill {
  id: number;
  beneficiary: string;
  paymentDestination: string;
  sponsor: string;
  amount: string;
  description: string;
  status: BillStatus;
  createdAt: number;
  paidAt: number;
}

export interface BillRequest {
  sponsor: string;
  paymentDestination: string;
  amount: string;
  description: string;
}

class Web3Service {
  private provider: ethers.providers.JsonRpcProvider;
  private billPaymentContract: ethers.Contract;
  private u2kTokenContract: ethers.Contract;

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(RPC_PROVIDER_URL);
    
    this.billPaymentContract = new ethers.Contract(
      BILL_PAYMENT_SYSTEM_ADDRESS,
      BILL_PAYMENT_SYSTEM_ABI,
      this.provider
    );
    
    this.u2kTokenContract = new ethers.Contract(
      U2K_TOKEN_ADDRESS,
      U2K_TOKEN_ABI,
      this.provider
    );
  }

  /**
   * Returns a contract instance with a signer for write operations
   * @param privateKey The private key of the user to sign transactions
   * @param contractType 'billPayment' or 'token'
   * @returns Contract with signer
   */
  private getContractWithSigner(privateKey: string, contractType: 'billPayment' | 'token'): ethers.Contract {
    const wallet = new ethers.Wallet(privateKey, this.provider);
    
    if (contractType === 'billPayment') {
      return this.billPaymentContract.connect(wallet);
    } else {
      return this.u2kTokenContract.connect(wallet);
    }
  }

  /**
   * Get bill details from blockchain
   * @param billId The ID of the bill to fetch
   * @returns Bill details
   */
  async getBill(billId: number): Promise<Web3Bill> {
    try {
      const bill = await this.billPaymentContract.getBill(billId);
      return this.formatBill(bill);
    } catch (error) {
      console.error('Error fetching bill:', error);
      throw new Error('Failed to fetch bill from blockchain');
    }
  }

  /**
   * Get all bills for a beneficiary
   * @param beneficiaryAddress The address of the beneficiary
   * @returns Array of bill IDs
   */
  async getBeneficiaryBills(beneficiaryAddress: string): Promise<number[]> {
    try {
      const billIds = await this.billPaymentContract.getBeneficiaryBills(beneficiaryAddress);
      return billIds.map((id: ethers.BigNumber) => id.toNumber());
    } catch (error) {
      console.error('Error fetching beneficiary bills:', error);
      throw new Error('Failed to fetch beneficiary bills from blockchain');
    }
  }

  /**
   * Get all bills for a sponsor
   * @param sponsorAddress The address of the sponsor
   * @returns Array of bill IDs
   */
  async getSponsorBills(sponsorAddress: string): Promise<number[]> {
    try {
      const billIds = await this.billPaymentContract.getSponsorBills(sponsorAddress);
      return billIds.map((id: ethers.BigNumber) => id.toNumber());
    } catch (error) {
      console.error('Error fetching sponsor bills:', error);
      throw new Error('Failed to fetch sponsor bills from blockchain');
    }
  }

  /**
   * Create a new bill payment request on the blockchain
   * @param request Bill request details
   * @param privateKey The private key of the beneficiary to sign the transaction
   * @returns The created bill ID
   */
  async createBill(request: BillRequest, privateKey: string): Promise<number> {
    try {
      const contract = this.getContractWithSigner(privateKey, 'billPayment');
      
      const tx = await contract.createBill(
        request.sponsor,
        request.paymentDestination,
        ethers.utils.parseEther(request.amount),
        request.description
      );
      
      const receipt = await tx.wait();
      
      // Find the BillCreated event and extract the billId
      const event = receipt.events?.find(e => e.event === 'BillCreated');
      if (!event) throw new Error('Bill creation event not found');
      
      const billId = event.args?.billId.toNumber();
      return billId;
    } catch (error) {
      console.error('Error creating bill:', error);
      throw new Error('Failed to create bill on blockchain');
    }
  }

  /**
   * Pay a bill with native currency (ETH)
   * @param billId The ID of the bill to pay
   * @param privateKey The private key of the sponsor to sign the transaction
   * @returns Transaction receipt
   */
  async payBillWithNative(billId: number, privateKey: string): Promise<ethers.ContractReceipt> {
    try {
      const contract = this.getContractWithSigner(privateKey, 'billPayment');
      
      // Get the bill first to know the amount to send
      const bill = await this.getBill(billId);
      const valueToSend = ethers.utils.parseEther(bill.amount);
      
      const tx = await contract.payBillWithNative(billId, { value: valueToSend });
      const receipt = await tx.wait();
      
      return receipt;
    } catch (error) {
      console.error('Error paying bill with native currency:', error);
      throw new Error('Failed to pay bill with native currency');
    }
  }

  /**
   * Pay a bill with U2K tokens
   * @param billId The ID of the bill to pay
   * @param privateKey The private key of the sponsor to sign the transaction
   * @returns Transaction receipt
   */
  async payBillWithU2K(billId: number, privateKey: string): Promise<ethers.ContractReceipt> {
    try {
      const wallet = new ethers.Wallet(privateKey, this.provider);
      const tokenContract = this.u2kTokenContract.connect(wallet);
      const billPaymentContract = this.getContractWithSigner(privateKey, 'billPayment');
      
      // Get the bill to know the amount
      const bill = await this.getBill(billId);
      const amountToSend = ethers.utils.parseEther(bill.amount);
      
      // First approve the token transfer
      const approveTx = await tokenContract.approve(BILL_PAYMENT_SYSTEM_ADDRESS, amountToSend);
      await approveTx.wait();
      
      // Then pay the bill
      const payTx = await billPaymentContract.payBillWithU2K(billId);
      const receipt = await payTx.wait();
      
      return receipt;
    } catch (error) {
      console.error('Error paying bill with U2K tokens:', error);
      throw new Error('Failed to pay bill with U2K tokens');
    }
  }

  /**
   * Reject a bill payment request
   * @param billId The ID of the bill to reject
   * @param privateKey The private key of the sponsor to sign the transaction
   * @returns Transaction receipt
   */
  async rejectBill(billId: number, privateKey: string): Promise<ethers.ContractReceipt> {
    try {
      const contract = this.getContractWithSigner(privateKey, 'billPayment');
      
      const tx = await contract.rejectBill(billId);
      const receipt = await tx.wait();
      
      return receipt;
    } catch (error) {
      console.error('Error rejecting bill:', error);
      throw new Error('Failed to reject bill on blockchain');
    }
  }

  /**
   * Get U2K token balance for an address
   * @param address The address to check balance for
   * @returns The balance in ETH format (as a string)
   */
  async getTokenBalance(address: string): Promise<string> {
    try {
      const balance = await this.u2kTokenContract.balanceOf(address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Error fetching token balance:', error);
      throw new Error('Failed to fetch token balance');
    }
  }

  /**
   * Get sponsor token reward balance
   * @param sponsorAddress The address of the sponsor
   * @returns The balance in ETH format (as a string)
   */
  async getSponsorTokenBalance(sponsorAddress: string): Promise<string> {
    try {
      const balance = await this.billPaymentContract.sponsorTokenBalance(sponsorAddress);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Error fetching sponsor token balance:', error);
      throw new Error('Failed to fetch sponsor token balance');
    }
  }

  /**
   * Format bill data from the blockchain into a more usable format
   * @param billData The raw bill data from the blockchain
   * @returns Formatted bill object
   */
  private formatBill(billData: any): Web3Bill {
    return {
      id: billData.id.toNumber(),
      beneficiary: billData.beneficiary,
      paymentDestination: billData.paymentDestination,
      sponsor: billData.sponsor,
      amount: ethers.utils.formatEther(billData.amount),
      description: billData.description,
      status: billData.status,
      createdAt: billData.createdAt.toNumber(),
      paidAt: billData.paidAt.toNumber()
    };
  }
}

// Export a singleton instance
export const web3Service = new Web3Service(); 