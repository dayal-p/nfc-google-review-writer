import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Copy, ExternalLink, Printer, Check, Info } from 'lucide-react';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUrl: string;
  businessName: string;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  targetUrl,
  businessName,
}) => {
  const qrRef = useRef<SVGSVGElement | null>(null);

  if (!isOpen) return null;

  const downloadSvg = () => {
    if (!qrRef.current) return;
    const svgData = new XMLSerializer().serializeToString(qrRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `${(businessName || 'google-review').toLowerCase().replace(/\s+/g, '-')}-qr.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  const downloadPng = () => {
    if (!qrRef.current) return;
    const svgData = new XMLSerializer().serializeToString(qrRef.current);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    // High resolution 1024x1024 for print quality
    const size = 1024;
    canvas.width = size;
    canvas.height = size;

    img.onload = () => {
      if (!ctx) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      // Margin of 64px
      const margin = 64;
      ctx.drawImage(img, margin, margin, size - margin * 2, size - margin * 2);

      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${(businessName || 'google-review').toLowerCase().replace(/\s+/g, '-')}-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-lg text-white">
              Printable Vector QR Code
            </h3>
            <p className="text-xs text-slate-400">
              For hybrid NFC cards, counter displays &amp; stickers
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="my-6 flex flex-col items-center">
          <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-slate-800/50">
            <QRCodeSVG
              ref={qrRef}
              value={targetUrl || 'https://search.google.com'}
              size={220}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
              includeMargin={false}
            />
          </div>

          <p className="font-semibold text-white text-sm mt-3 text-center">
            {businessName || 'Direct Google Review'}
          </p>
          <p className="font-mono text-[11px] text-slate-400 max-w-xs truncate mt-0.5">
            {targetUrl}
          </p>
        </div>

        {/* Print Card Specifications */}
        <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs space-y-1.5 mb-5">
          <div className="flex items-center gap-1.5 text-blue-400 font-semibold text-[11px]">
            <Printer className="w-3.5 h-3.5" />
            <span>Card Printing Specs (ISO/IEC 7810 ID-1)</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-300 text-[11px]">
            <div>
              <span className="text-slate-500 block">Dimensions:</span>
              85.60 mm × 53.98 mm
            </div>
            <div>
              <span className="text-slate-500 block">Corner Radius:</span>
              3.18 mm (0.125 in)
            </div>
            <div>
              <span className="text-slate-500 block">Suggested QR Size:</span>
              20 mm to 25 mm square
            </div>
            <div>
              <span className="text-slate-500 block">Format:</span>
              SVG (Vector) or High-Res PNG
            </div>
          </div>
        </div>

        {/* Download Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={downloadSvg}
            className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download SVG (Vector)</span>
          </button>
          <button
            onClick={downloadPng}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all border border-slate-700"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Download PNG (1024px)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
