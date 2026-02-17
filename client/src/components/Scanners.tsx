import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export function Scanner({ onScan, onClose }: ScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scannerRef.current) return;

    const html5QrCode = new Html5Qrcode("reader");
    
    const config = { 
      fps: 10, 
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      formatsToSupport: [
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39
      ]
    };

    html5QrCode
      .start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          // Success
          html5QrCode.stop().then(() => {
            onScan(decodedText);
          });
        },
        (errorMessage) => {
          // parse error, ignore it.
          // console.log(errorMessage);
        }
      )
      .catch((err) => {
        console.error("Error starting scanner", err);
        setError("Could not start camera. Please ensure you've granted permissions.");
      });

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute top-4 right-4 z-50">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="text-white hover:bg-white/20 rounded-full h-12 w-12"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      <div className="w-full max-w-md p-4 flex flex-col items-center">
        <h2 className="text-white text-2xl font-display font-bold mb-6 text-center">
          Scan Barcode
        </h2>
        
        <div className="relative w-full aspect-square bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <div id="reader" className="w-full h-full" ref={scannerRef}></div>
          
          {/* Overlay styling for the scanner box */}
          {!error && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-primary/50 rounded-lg relative">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-primary -mt-1 -ml-1"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-primary -mt-1 -mr-1"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-primary -mb-1 -ml-1"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-primary -mb-1 -mr-1"></div>
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary/50 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
              <div className="text-red-400">
                <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{error}</p>
              </div>
            </div>
          )}
        </div>
        
        <p className="text-white/60 mt-6 text-center text-sm max-w-xs">
          Point your camera at a barcode or QR code to automatically scan it.
        </p>
      </div>
    </div>
  );
}
