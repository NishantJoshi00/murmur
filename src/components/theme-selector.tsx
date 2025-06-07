'use client';

import { useCustomTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Palette } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeSelector() {
  const { currentTheme, setTheme, availableThemes } = useCustomTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="w-auto min-w-[140px] h-9">
        <span className="sr-only">Loading theme selector</span>
      </Button>
    );
  }

  return (
    <Select value={currentTheme} onValueChange={setTheme}>
      <SelectTrigger className="w-auto min-w-[140px] h-9">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(availableThemes).map(([key, theme]) => (
          <SelectItem key={key} value={key}>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full border border-border"
                style={{
                  backgroundColor: theme.colors.primary,
                }}
              />
              {theme.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}