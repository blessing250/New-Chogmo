import React, { useEffect } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  text: string;
}

const QRCodeGenerator = React.forwardRef<HTMLCanvasElement, QRCodeGeneratorProps>(
  ({ text }, ref) => {
    useEffect(() => {
      if (ref && 'current' in ref && ref.current && text) {
        QRCode.toCanvas(ref.current, text, { width: 200 }, (error) => {
          if (error) console.error(error);
        });
      }
    }, [text, ref]);

    return <canvas ref={ref} />;
  }
);

export default QRCodeGenerator;
