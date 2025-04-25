declare module 'paystack' {
  function Paystack(secretKey: string): {
    transaction: {
      initialize(params: {
        email: string;
        amount: number;
        metadata?: any;
        reference?: string;
        name?: string;
        [key: string]: any;
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
