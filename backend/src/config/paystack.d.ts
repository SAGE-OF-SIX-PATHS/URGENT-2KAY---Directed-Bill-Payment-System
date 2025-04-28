declare module 'paystack' {
  function Paystack(secretKey: string): {
    transaction: {
      initialize(params: {
        email: string;
        amount: number;
        reference?: string;
        name?: string;
        callback_url?: string;
        metadata?: any;
        [key: string]: any;
      }): Promise<any>;
      verify(reference: string): Promise<any>;
    };
    misc: {
      resolveAccount(params: {
        account_number: string;
        bank_code: string;
      }): Promise<any>;
      list_banks(params: {
        country: string;
      }): Promise<any>;
    };
    transferrecipient: {
      create(params: {
        type: string;
        name: string;
        account_number: string;
        bank_code: string;
        currency: string;
      }): Promise<any>;
    };
    transfer: {
      create(params: {
        source: string;
        reason: string;
        amount: number;
        recipient: string;
      }): Promise<any>;
    };
    airtime?: {
      send(params: {
        phone: string;
        amount: number;
        network: string;
      }): Promise<any>;
    };
  };

  export = Paystack;
}