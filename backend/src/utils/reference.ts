import { v4 as uuidv4 } from 'uuid';

export function generateReference(): string {
          return uuidv4();
}