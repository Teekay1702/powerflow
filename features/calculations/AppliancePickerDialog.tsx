'use client';

import { useState, useEffect } from 'react';
import { Search, Plug } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppliances } from '@/hooks/useAppliances';
import type { ApplianceCatalogueItem } from '@/types';

interface AppliancePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (item: ApplianceCatalogueItem) => void;
}

export function AppliancePickerDialog({ open, onOpenChange, onSelect }: AppliancePickerDialogProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const { data, isLoading } = useAppliances(search);

  // Reset search when dialog closes.
  useEffect(() => {
    if (!open) {
      setSearch('');
      setCategory('all');
    }
  }, [open]);

  const items = (data?.data ?? []).filter((i) => category === 'all' || i.category === category);

  const handleSelect = (item: ApplianceCatalogueItem) => {
    onSelect(item);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5" />
            Set Appliance
          </DialogTitle>
          <DialogDescription>
            Search a make / model and the estimated wattage will be filled in automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. LG double door fridge"
              className="pl-9"
              autoFocus
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="Refrigeration">Refrigeration</SelectItem>
              <SelectItem value="Cooling">Cooling</SelectItem>
              <SelectItem value="Heating">Heating</SelectItem>
              <SelectItem value="Kitchen">Kitchen</SelectItem>
              <SelectItem value="Laundry">Laundry</SelectItem>
              <SelectItem value="Entertainment">Entertainment</SelectItem>
              <SelectItem value="Lighting">Lighting</SelectItem>
              <SelectItem value="Office">Office</SelectItem>
              <SelectItem value="Business">Business</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto rounded-md border mt-1">
          {isLoading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-sm text-muted-foreground">
              <Plug className="h-6 w-6 mb-2" />
              No appliances found.
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {item.make} &middot; {item.model}
                        </p>
                        <p className="text-xs text-slate-500">{item.category}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-slate-900">{item.wattage} W</p>
                        <p className="text-[10px] text-slate-400">est. running</p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
