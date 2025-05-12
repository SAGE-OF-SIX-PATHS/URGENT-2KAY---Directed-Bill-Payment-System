import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from '../service/prisma.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  async handlePaystackWebhook(@Req() req: Request, @Res() res: Response) {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    // Verify the webhook signature
    const signature = req.headers['x-paystack-signature'];
    const payload = JSON.stringify(req.body);

    if (!signature || !secret) {
      return res.status(400).send('Invalid webhook signature');
    }

    const crypto = require('crypto');
    const hash = crypto.createHmac('sha512', secret).update(payload).digest('hex');

    if (hash !== signature) {
      return res.status(400).send('Invalid webhook signature');
    }

    const event = req.body.event;

    if (event === 'charge.success') {
      const reference = req.body.data.reference;

      // Find the bill by reference and update its status
      const bill = await this.prisma.bill.findFirst({
        where: { metadata: { some: { key: 'reference', value: reference } } },
      });

      if (bill) {
        await this.prisma.bill.update({
          where: { id: bill.id },
          data: { isPaid: true, paymentStatus: 'PAID' },
        });
      }
    }

    return res.status(200).send('Webhook processed');
  }
}
