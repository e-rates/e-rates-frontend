'use client';

import React, { useState, useMemo } from 'react';
import { SubCountyRecord, WardRecord, saveCountyLocations, getCountyLocations } from './locationsData';
import { Plus, Search, Trash2, Edit2, Check, X, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface WardsManagerProps {
  county: string;
  subCounties: SubCountyRecord[];
  wards: WardRecord[];
  onLocationsChange: (subCounties: SubCountyRecord[], wards: WardRecord[]) => void;
}

export const WardsManager: React.FC<WardsManagerProps> = ({
  county,
  subCounties,
  wards,
  onLocationsChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Add forms
  const [showAddSubCounty, setShowAddSubCounty] = useState(false);
  const [newSubCountyName, setNewSubCountyName] = useState('');
  const [showAddWardForSc, setShowAddWardForSc] = useState<string | null>(null);
  const [newWardName, setNewWardName] = useState('');

  // Edit states
  const [editingWardId, setEditingWardId] = useState<string | null>(null);
  const [editWardName, setEditWardName] = useState('');
  const [editingScId, setEditingScId] = useState<string | null>(null);
  const [editScName, setEditScName] = useState('');

  // Collapsed sub-counties (collapsed by default if > 4 wards to save space)
  const [collapsedScs, setCollapsedScs] = useState<Set<string>>(new Set());

  const toggleCollapse = (scId: string) => {
    setCollapsedScs((prev) => {
      const next = new Set(prev);
      if (next.has(scId)) next.delete(scId);
      else next.add(scId);
      return next;
    });
  };

  // Grouped + filtered data
  const groupedData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return subCounties.map((sc) => {
      const scWards = wards.filter(
        (w) =>
          w.subCountyName.toLowerCase() === sc.name.toLowerCase() &&
          (!q || w.name.toLowerCase().includes(q) || sc.name.toLowerCase().includes(q))
      );
      const visible = !q || sc.name.toLowerCase().includes(q) || scWards.length > 0;
      return { sc, scWards, visible };
    });
  }, [subCounties, wards, searchQuery]);

  // ── Sub-County CRUD ──────────────────────────────────────────────
  const handleAddSubCounty = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSubCountyName.trim();
    if (!trimmed) { toast.error('Enter a sub-county name'); return; }
    if (subCounties.some((sc) => sc.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('Sub-county already exists'); return;
    }
    const newRecord: SubCountyRecord = {
      id: `sc_${county.toLowerCase()}_${Date.now()}`,
      name: trimmed,
      county,
    };
    const updatedScs = [...subCounties, newRecord].sort((a, b) => a.name.localeCompare(b.name));
    onLocationsChange(updatedScs, wards);
    saveCountyLocations(county, { subCounties: updatedScs, wards });
    setNewSubCountyName('');
    setShowAddSubCounty(false);
    toast.success(`Added sub-county "${trimmed}"`);
  };

  const saveEditSc = (oldName: string) => {
    const trimmed = editScName.trim();
    if (!trimmed) { toast.error('Name cannot be empty'); return; }
    const updatedScs = subCounties.map((sc) => sc.id === editingScId ? { ...sc, name: trimmed } : sc);
    const updatedWards = wards.map((w) =>
      w.subCountyName.toLowerCase() === oldName.toLowerCase() ? { ...w, subCountyName: trimmed } : w
    );
    onLocationsChange(updatedScs, updatedWards);
    saveCountyLocations(county, { subCounties: updatedScs, wards: updatedWards });
    setEditingScId(null);
    toast.success(`Renamed to "${trimmed}"`);
  };

  const handleDeleteSc = (sc: SubCountyRecord) => {
    const attached = wards.filter((w) => w.subCountyName.toLowerCase() === sc.name.toLowerCase());
    const msg = attached.length > 0
      ? `Delete "${sc.name}" and its ${attached.length} ward(s)?`
      : `Delete sub-county "${sc.name}"?`;
    if (!window.confirm(msg)) return;
    const updatedScs = subCounties.filter((item) => item.id !== sc.id);
    const updatedWards = wards.filter((w) => w.subCountyName.toLowerCase() !== sc.name.toLowerCase());
    onLocationsChange(updatedScs, updatedWards);
    saveCountyLocations(county, { subCounties: updatedScs, wards: updatedWards });
    toast.success(`Deleted "${sc.name}"`);
  };

  // ── Ward CRUD ────────────────────────────────────────────────────
  const handleAddWard = (e: React.FormEvent, scName: string) => {
    e.preventDefault();
    const trimmed = newWardName.trim();
    if (!trimmed) { toast.error('Enter a ward name'); return; }
    if (wards.some((w) => w.name.toLowerCase() === trimmed.toLowerCase() && w.subCountyName.toLowerCase() === scName.toLowerCase())) {
      toast.error(`Ward already exists in ${scName}`); return;
    }
    const newRecord: WardRecord = {
      id: `w_${county.toLowerCase()}_${Date.now()}`,
      name: trimmed,
      subCountyName: scName,
      county,
    };
    const updatedWards = [...wards, newRecord].sort((a, b) => a.name.localeCompare(b.name));
    onLocationsChange(subCounties, updatedWards);
    saveCountyLocations(county, { subCounties, wards: updatedWards });
    setNewWardName('');
    setShowAddWardForSc(null);
    toast.success(`Added "${trimmed}" to ${scName}`);
  };

  const saveEditWard = (id: string) => {
    const trimmed = editWardName.trim();
    if (!trimmed) { toast.error('Ward name cannot be empty'); return; }
    const updatedWards = wards.map((w) => w.id === id ? { ...w, name: trimmed } : w);
    onLocationsChange(subCounties, updatedWards);
    saveCountyLocations(county, { subCounties, wards: updatedWards });
    setEditingWardId(null);
    toast.success('Updated ward');
  };

  const handleDeleteWard = (w: WardRecord) => {
    if (!window.confirm(`Delete ward "${w.name}"?`)) return;
    const updatedWards = wards.filter((item) => item.id !== w.id);
    onLocationsChange(subCounties, updatedWards);
    saveCountyLocations(county, { subCounties, wards: updatedWards });
    toast.success(`Deleted "${w.name}"`);
  };

  const handleResetToDefault = () => {
    if (!window.confirm(`Reset ${county} County to official gazetted boundaries?`)) return;
    const key = `erates_locations_v2_${county.trim().toLowerCase().replace(/county/g, '').trim()}`;
    try { localStorage.removeItem(key); } catch {}
    const defaults = getCountyLocations(county);
    onLocationsChange(defaults.subCounties, defaults.wards);
    toast.success(`Reset ${county} to IEBC boundaries`);
  };

  const visibleGroups = groupedData.filter((g) => g.visible);

  return (
    <div className="flex flex-col h-full bg-card-bg">

      {/* ── Top bar: search + actions ── */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-200 dark:border-neutral-800">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`${subCounties.length} sub-counties · ${wards.length} wards`}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-none border border-border-default bg-panel-bg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Actions */}
        <button
          type="button"
          onClick={handleResetToDefault}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-none border border-border-default bg-panel-bg hover:bg-hover-surface text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0"
          title="Restore official gazetted boundaries"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
        <button
          type="button"
          onClick={() => setShowAddSubCounty((p) => !p)}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-none border border-border-default bg-neutral-100 hover:bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          Sub-County
        </button>
      </div>

      {/* ── Add Sub-County inline ── */}
      {showAddSubCounty && (
        <form onSubmit={handleAddSubCounty} className="flex items-center gap-2 px-3 py-2 border-b border-border-default bg-neutral-50 dark:bg-neutral-900/60">
          <input
            type="text"
            value={newSubCountyName}
            onChange={(e) => setNewSubCountyName(e.target.value)}
            placeholder="Sub-county name"
            className="flex-1 rounded-none border border-border-default bg-white px-2.5 py-1 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary dark:bg-neutral-800"
            autoFocus
          />
          <button type="submit" className="px-2.5 py-1 text-xs font-semibold rounded-none bg-primary text-white hover:opacity-90 cursor-pointer">Save</button>
          <button type="button" onClick={() => setShowAddSubCounty(false)} className="p-1 text-text-tertiary hover:text-text-primary cursor-pointer"><X className="h-3.5 w-3.5" /></button>
        </form>
      )}

      {/* ── 2-column Sub-County grid ── */}
      <div className="flex-1 overflow-auto">
        {visibleGroups.length === 0 ? (
          <p className="text-center text-xs text-text-tertiary py-8">No results for "{searchQuery}"</p>
        ) : (
          <div className="grid grid-cols-2 gap-0">
            {visibleGroups.map(({ sc, scWards }) => {
              const isCollapsed = collapsedScs.has(sc.id);
              const isEditingSc = editingScId === sc.id;

              return (
                <div
                  key={sc.id}
                  className="border-r border-b border-neutral-200 dark:border-neutral-800 bg-panel-bg flex flex-col"
                >
                  {/* Sub-county header */}
                  <div className="group flex items-center gap-1 px-2 py-1.5 bg-neutral-50 dark:bg-neutral-900/50">
                    <button
                      type="button"
                      onClick={() => toggleCollapse(sc.id)}
                      className="shrink-0 text-text-tertiary hover:text-text-primary cursor-pointer"
                    >
                      {isCollapsed
                        ? <ChevronRight className="h-3 w-3" />
                        : <ChevronDown className="h-3 w-3" />}
                    </button>

                    {isEditingSc ? (
                      <>
                        <input
                          type="text"
                          value={editScName}
                          onChange={(e) => setEditScName(e.target.value)}
                          className="flex-1 min-w-0 rounded-none border border-border-default bg-white px-1.5 py-0 text-[11px] font-semibold text-text-primary dark:bg-neutral-800"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && saveEditSc(sc.name)}
                        />
                        <button onClick={() => saveEditSc(sc.name)} className="shrink-0 p-0.5 text-emerald-600 hover:bg-emerald-50 cursor-pointer"><Check className="h-3 w-3" /></button>
                        <button onClick={() => setEditingScId(null)} className="shrink-0 p-0.5 text-text-tertiary hover:bg-hover-surface cursor-pointer"><X className="h-3 w-3" /></button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 min-w-0 truncate text-[11px] font-semibold uppercase tracking-wide text-text-primary">
                          {sc.name}
                        </span>
                        <span className="shrink-0 text-[10px] text-text-tertiary mr-1">({scWards.length})</span>
                        {/* Hover actions */}
                        <div className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => { setShowAddWardForSc(sc.id); setNewWardName(''); }}
                            className="flex items-center gap-0.5 px-1 py-0.5 text-[10px] font-semibold rounded-none bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                            title="Add ward"
                          >
                            <Plus className="h-2.5 w-2.5" />
                          </button>
                          <button onClick={() => { setEditingScId(sc.id); setEditScName(sc.name); }} className="p-0.5 text-text-tertiary hover:text-text-primary cursor-pointer" title="Edit"><Edit2 className="h-2.5 w-2.5" /></button>
                          <button onClick={() => handleDeleteSc(sc)} className="p-0.5 text-text-tertiary hover:text-red-600 cursor-pointer" title="Delete"><Trash2 className="h-2.5 w-2.5" /></button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Add ward inline */}
                  {!isCollapsed && showAddWardForSc === sc.id && (
                    <form
                      onSubmit={(e) => handleAddWard(e, sc.name)}
                      className="flex items-center gap-1 px-2 py-1 bg-primary/5"
                    >
                      <input
                        type="text"
                        value={newWardName}
                        onChange={(e) => setNewWardName(e.target.value)}
                        placeholder="Ward name"
                        className="flex-1 min-w-0 rounded-none border border-border-default bg-white px-1.5 py-0.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary dark:bg-neutral-800"
                        autoFocus
                      />
                      <button type="submit" className="shrink-0 px-1.5 py-0.5 text-[10px] font-semibold rounded-none bg-primary text-white hover:opacity-90 cursor-pointer">Add</button>
                      <button type="button" onClick={() => setShowAddWardForSc(null)} className="shrink-0 p-0.5 text-text-tertiary cursor-pointer"><X className="h-3 w-3" /></button>
                    </form>
                  )}

                  {/* Wards list (1 col inside the card — card is already half-width) */}
                  {!isCollapsed && (
                    <div className="flex flex-col py-0.5">
                      {scWards.length === 0 && showAddWardForSc !== sc.id ? (
                        <p className="px-3 py-2 text-[11px] text-text-tertiary italic">No wards yet</p>
                      ) : (
                        scWards.map((w) => {
                          const isEditingWard = editingWardId === w.id;
                          return (
                            <div
                              key={w.id}
                              className="group/ward flex items-center gap-1 px-3 py-0.5 hover:bg-hover-surface/40 transition-colors"
                            >
                              {isEditingWard ? (
                                <>
                                  <input
                                    type="text"
                                    value={editWardName}
                                    onChange={(e) => setEditWardName(e.target.value)}
                                    className="flex-1 min-w-0 rounded-none border border-border-default bg-white px-1.5 py-0 text-xs text-text-primary dark:bg-neutral-800"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && saveEditWard(w.id)}
                                  />
                                  <button onClick={() => saveEditWard(w.id)} className="shrink-0 p-0.5 text-emerald-600 cursor-pointer"><Check className="h-2.5 w-2.5" /></button>
                                  <button onClick={() => setEditingWardId(null)} className="shrink-0 p-0.5 text-text-tertiary cursor-pointer"><X className="h-2.5 w-2.5" /></button>
                                </>
                              ) : (
                                <>
                                  <span className="flex-1 min-w-0 truncate text-xs text-text-secondary">{w.name}</span>
                                  <div className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover/ward:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => { setEditingWardId(w.id); setEditWardName(w.name); }}
                                      className="p-0.5 text-text-tertiary hover:text-text-primary cursor-pointer"
                                    ><Edit2 className="h-2.5 w-2.5" /></button>
                                    <button
                                      onClick={() => handleDeleteWard(w)}
                                      className="p-0.5 text-text-tertiary hover:text-red-600 cursor-pointer"
                                    ><Trash2 className="h-2.5 w-2.5" /></button>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
