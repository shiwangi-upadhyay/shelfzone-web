'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PIISectionProps {
  aadhaar?: string;
  pan?: string;
}

export function PIISection({ aadhaar, pan }: PIISectionProps) {
  const [revealAadhaar, setRevealAadhaar] = useState(false);
  const [revealPan, setRevealPan] = useState(false);

  const maskAadhaar = (value: string) => {
    if (!value) return 'Not provided';
    return revealAadhaar ? value : `XXXX XXXX ${value.slice(-4)}`;
  };

  const maskPan = (value: string) => {
    if (!value) return 'Not provided';
    return revealPan ? value : `XXXXX${value.slice(-4)}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Sensitive Information</CardTitle>
            <CardDescription>Personal identification details</CardDescription>
          </div>
          <Shield className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            This information is encrypted and securely stored
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Aadhaar Number</p>
              <p className="font-mono text-lg">
                {maskAadhaar(aadhaar || '')}
              </p>
            </div>
            {aadhaar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRevealAadhaar(!revealAadhaar)}
              >
                {revealAadhaar ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Reveal
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">PAN Number</p>
              <p className="font-mono text-lg">
                {maskPan(pan || '')}
              </p>
            </div>
            {pan && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRevealPan(!revealPan)}
              >
                {revealPan ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Reveal
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Only you and authorized HR personnel can view this information
        </p>
      </CardContent>
    </Card>
  );
}
