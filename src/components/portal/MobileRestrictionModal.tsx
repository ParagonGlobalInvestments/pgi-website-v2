'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import DecryptedText from '@/components/reactbits/TextAnimations/DecryptedText/DecryptedText';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface MobileRestrictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function MobileRestrictionModal({
  isOpen,
  onClose,
  message = "We are still working on previewing documents on mobile. For now, please view all documents from the website.",
}: MobileRestrictionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6 pb-6 px-8 bg-white">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-blue-600" />
                </div>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-center text-gray-900">
                    <DecryptedText
                      text="Sorry! We're Still Working On:"
                      sequential={true}
                      revealDirection="start"
                      animateOn="view"
                      speed={30}
                      useOriginalCharsOnly={true}
                      className="text-2xl font-bold text-center text-gray-900"
                    />
                  </DialogTitle>
                </DialogHeader>
                <p className="text-gray-600 leading-relaxed">
                  {message}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

