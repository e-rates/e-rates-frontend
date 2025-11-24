import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface EPSGSelectorProps {
  sourceEpsg: number | undefined;
  onSourceEpsgChange: (epsg: number | undefined) => void;
  suggestions: Array<{
    epsg: number | null;
    name: string;
    confidence: string;
    reason: string;
  }>;
  disabled?: boolean;
  needsEpsg?: boolean;
}

export const EPSGSelector: React.FC<EPSGSelectorProps> = ({
  sourceEpsg,
  onSourceEpsgChange,
  suggestions,
  disabled,
  needsEpsg,
}) => {
  const hasSuggestions = suggestions.length > 0;
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="w-full max-w-3xl">
      <div className="rounded-lg border border-border bg-card p-4">
        {needsEpsg && (
          <div className="mb-4 rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-3 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-300">
                  Coordinate System Not Found
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                  The shapefile is missing a .prj file. Please select the correct
                  EPSG code below. The system will automatically reproject to WGS84.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mb-2">
          <label className="text-sm font-medium">
            Source EPSG Code
          </label>
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="focus:outline-none"
            >
              <Info className="h-4 w-4 text-muted-foreground" />
            </button>
            {showTooltip && (
              <div className="absolute left-0 top-6 z-50 w-64 rounded-md border border-border bg-popover p-3 text-xs text-popover-foreground shadow-md">
                EPSG code defines the coordinate system of your shapefile.
                Most Kenya shapefiles use EPSG:21037 (Arc 1960 UTM 37S).
                Leave blank if your shapefile includes a .prj file.
              </div>
            )}
          </div>
        </div>

        {hasSuggestions ? (
          <div className="space-y-2">
            <select
              value={sourceEpsg || ''}
              onChange={(e) =>
                onSourceEpsgChange(e.target.value ? Number(e.target.value) : undefined)
              }
              disabled={disabled}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">-- Select EPSG Code --</option>
              {suggestions.map((suggestion) => (
                <option
                  key={suggestion.epsg || 'unknown'}
                  value={suggestion.epsg || ''}
                  disabled={!suggestion.epsg}
                >
                  {suggestion.epsg
                    ? `EPSG:${suggestion.epsg} - ${suggestion.name} (${suggestion.confidence} confidence)`
                    : suggestion.name}
                </option>
              ))}
            </select>

            {/* Show reason for selected EPSG */}
            {sourceEpsg && suggestions.find(s => s.epsg === sourceEpsg) && (
              <p className="text-xs text-muted-foreground">
                ℹ️ {suggestions.find(s => s.epsg === sourceEpsg)?.reason}
              </p>
            )}
          </div>
        ) : (
          <input
            type="number"
            value={sourceEpsg || ''}
            onChange={(e) =>
              onSourceEpsgChange(e.target.value ? Number(e.target.value) : undefined)
            }
            placeholder="e.g., 21037"
            disabled={disabled}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        )}

        <p className="text-xs text-muted-foreground mt-2">
          Common Kenya EPSG codes: <strong>21037</strong> (Arc 1960 UTM 37S - Most common),
          <strong> 21036</strong> (UTM 36S Western Kenya),
          <strong> 32737</strong> (WGS84 UTM 37S)
        </p>
      </div>
    </div>
  );
};
