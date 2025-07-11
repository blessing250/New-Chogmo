import React, { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface QRCodeBoxProps {
  member: {
    _id?: string;
    id?: string;
    email: string;
    name: string;
    membership: string;
    membershipExpiry?: string;
  };
}

const QRCodeBox: React.FC<QRCodeBoxProps> = ({ member }) => {
  const qrCodeRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (member && qrCodeRef.current) {
      const qrData = JSON.stringify({
        userId: member._id || member.id,
        email: member.email,
        name: member.name,
        membership: member.membership,
        membershipExpiry: member.membershipExpiry,
      });
      QRCode.toCanvas(qrCodeRef.current, qrData, {
        width: 200,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
    }
  }, [member]);

  const handleDownload = () => {
    if (qrCodeRef.current) {
      const link = document.createElement("a");
      link.download = "membership-qr.png";
      link.href = qrCodeRef.current.toDataURL("image/png");
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <canvas ref={qrCodeRef} className="bg-white p-4 rounded-lg shadow-md" />
      <div className="flex space-x-4">
        <button
          onClick={handleDownload}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Download QR Code
        </button>
        <button
          onClick={() => window.print()}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Print QR Code
        </button>
      </div>
      <p className="text-sm text-gray-600">
        Scan this QR code to verify membership
      </p>
    </div>
  );
};

export default QRCodeBox;
