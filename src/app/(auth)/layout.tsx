import { Card } from '@/components/ui/card';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground text-2xl font-bold mb-4">
            S
          </div>
          <h1 className="text-2xl font-bold">ShelfZone</h1>
          <p className="text-sm text-muted-foreground">HR Management Portal</p>
        </div>
        
        <Card className="p-6">
          {children}
        </Card>
        
        <p className="text-center text-xs text-muted-foreground mt-4">
          © 2024 ShelfZone. All rights reserved.
        </p>
      </div>
    </div>
  );
}
