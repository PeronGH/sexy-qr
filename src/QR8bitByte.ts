import { QRMode } from './QRMode.ts';

export class QR8bitByte {
  mode = QRMode.MODE_8BIT_BYTE;

  data: string;

  parsedData: (number[] | number)[] = [];

  constructor(data) {
    this.data = data;

    // Added to support UTF-8 Characters
    let i = 0;
    const l = this.data.length;
    for (; i < l; i++) {
      const code = this.data.charCodeAt(i);

      let byteArray: number[];
      if (code > 0x10000) {
        // prettier-ignore
        byteArray = [
          0xf0 | ((code & 0x1c0000) >>> 18),
          0x80 | ((code & 0x3f000) >>> 12),
          0x80 | ((code & 0xfc0) >>> 6),
          0x80 | (code & 0x3f),
        ];
      } else if (code > 0x800) {
        // prettier-ignore
        byteArray = [
          0xe0 | ((code & 0xf000) >>> 12),
          0x80 | ((code & 0xfc0) >>> 6),
          0x80 | (code & 0x3f),
        ]
      } else if (code > 0x80) {
        // prettier-ignore
        byteArray = [
          0xc0 | ((code & 0x7c0) >>> 6),
          0x80 | (code & 0x3f),
        ]
      } else {
        byteArray = [code];
      }

      this.parsedData.push(byteArray);
    }

    this.parsedData = Array.prototype.concat.apply([], this.parsedData);

    if (this.parsedData.length !== this.data.length) {
      this.parsedData.unshift(191);
      this.parsedData.unshift(187);
      this.parsedData.unshift(239);
    }
  }

  getLength() {
    return this.parsedData.length;
  }

  write(buffer) {
    let i = 0;
    const l = this.parsedData.length;
    for (; i < l; i++) {
      buffer.put(this.parsedData[i], 8);
    }
  }
}
