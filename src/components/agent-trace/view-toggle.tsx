import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ViewToggleProps {
  value: 'org' | 'agent';
  onChange: (value: 'org' | 'agent') => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as 'org' | 'agent')}>
      <TabsList>
        <TabsTrigger value="org" className="gap-1.5">
          <span>👥</span>
          <span>Org View</span>
        </TabsTrigger>
        <TabsTrigger value="agent" className="gap-1.5">
          <span>🤖</span>
          <span>Agent View</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
