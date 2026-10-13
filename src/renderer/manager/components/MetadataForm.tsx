import React, { useState, useEffect } from 'react';
import { Plus, Check, Lock, Unlock, Sparkles } from 'lucide-react';
import { StickerItem } from '../../../types/models';
import { CustomAttributesEditor } from './CustomAttributesEditor';

interface MetadataFormProps {
  item: StickerItem;
  onUpdateMetadata: (itemId: string, metadata: any) => void;
}

export const MetadataForm: React.FC<MetadataFormProps> = ({ item, onUpdateMetadata }) => {
  const [character, setCharacter] = useState(item.metadata?.character || '');
  const [sourceOrigin, setSourceOrigin] = useState(item.metadata?.sourceOrigin || '');
  const [action, setAction] = useState(item.metadata?.action || '');
  const [feeling, setFeeling] = useState(item.metadata?.feeling || '');
  const [description, setDescription] = useState(item.metadata?.description || '');
  const [lockedFields, setLockedFields] = useState<Set<string>>(
    () => new Set(item.metadata?.userLockedFields || [])
  );
  const [newTagInput, setNewTagInput] = useState('');
  const [saved, setSaved] = useState(false);

  const lastUpdatedAt = item.metadata?.updatedAt;

  useEffect(() => {
    setCharacter(item.metadata?.character || '');
    setSourceOrigin(item.metadata?.sourceOrigin || '');
    setAction(item.metadata?.action || '');
    setFeeling(item.metadata?.feeling || '');
    setDescription(item.metadata?.description || '');
    setLockedFields(new Set(item.metadata?.userLockedFields || []));
    setSaved(false);
  }, [item.id, lastUpdatedAt]);

  const isLocked = (field: string) => lockedFields.has(field);

  const toggleLock = (field: string) => {
    setLockedFields((prev) => {
      const next = new Set(prev);
      if (next.has(field)) {
        next.delete(field);
      } else {
        next.add(field);
      }
      return next;
    });
  };

  const handleFieldChange = (
    field: string,
    val: string,
    setter: (v: string) => void,
    originalVal: string | null | undefined
  ) => {
    setter(val);
    if (val.trim() !== (originalVal || '').trim()) {
      setLockedFields((prev) => new Set(prev).add(field));
    }
  };

  const handleSave = () => {
    onUpdateMetadata(item.id, {
      character: character.trim() || undefined,
      sourceOrigin: sourceOrigin.trim() || undefined,
      action: action.trim() || undefined,
      feeling: feeling.trim() || undefined,
      description: description.trim() || undefined,
      tags: item.tags,
      userLockedFields: Array.from(lockedFields),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTagInput.trim().toLowerCase();
    if (!clean || item.tags.includes(clean)) return;

    onUpdateMetadata(item.id, {
      character: character.trim() || undefined,
      sourceOrigin: sourceOrigin.trim() || undefined,
      action: action.trim() || undefined,
      feeling: feeling.trim() || undefined,
      description: description.trim() || undefined,
      tags: [...item.tags, clean],
      userLockedFields: Array.from(lockedFields),
    });
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateMetadata(item.id, {
      character: character.trim() || undefined,
      sourceOrigin: sourceOrigin.trim() || undefined,
      action: action.trim() || undefined,
      feeling: feeling.trim() || undefined,
      description: description.trim() || undefined,
      tags: item.tags.filter((t) => t !== tagToRemove),
      userLockedFields: Array.from(lockedFields),
    });
  };

  const handleCustomAttributesChange = (updatedAttrs: Record<string, string>) => {
    onUpdateMetadata(item.id, {
      character: character.trim() || undefined,
      sourceOrigin: sourceOrigin.trim() || undefined,
      action: action.trim() || undefined,
      feeling: feeling.trim() || undefined,
      description: description.trim() || undefined,
      tags: item.tags,
      customAttributes: updatedAttrs,
      userLockedFields: Array.from(lockedFields),
    });
  };

  const renderLockToggle = (field: string) => {
    const locked = isLocked(field);
    return (
      <button
        type="button"
        onClick={() => toggleLock(field)}
        title={locked ? 'Protected from AI overwrite. Click to unlock.' : 'AI can update this field. Click to protect.'}
        className={`text-[10px] flex items-center space-x-1 px-1.5 py-0.5 rounded transition-colors ${
          locked
            ? 'bg-blue-500/15 border border-blue-500/30 text-blue-300 hover:bg-blue-500/25'
            : 'bg-gray-800/60 border border-gray-700/40 text-gray-400 hover:text-gray-200 hover:bg-gray-700/60'
        }`}
      >
        {locked ? <Lock className="w-2.5 h-2.5 text-blue-400" /> : <Unlock className="w-2.5 h-2.5 text-gray-500" />}
        <span>{locked ? 'Locked' : 'Unlocked'}</span>
      </button>
    );
  };

  return (
    <div className="space-y-3">
      {lockedFields.size > 0 && (
        <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-md text-[11px] text-blue-300">
          <Lock className="w-3 h-3 text-blue-400 flex-shrink-0" />
          <span>{lockedFields.size} field{lockedFields.size > 1 ? 's' : ''} protected from AI overwrite</span>
        </div>
      )}

      <div>
        <label className="text-gray-400 flex items-center justify-between mb-1">
          <span>Character / Entity</span>
          {renderLockToggle('character')}
        </label>
        <input
          type="text"
          placeholder="e.g. Sasuke, Pikachu, Pepe"
          value={character}
          onChange={(e) => handleFieldChange('character', e.target.value, setCharacter, item.metadata?.character)}
          className="w-full font-medium text-gray-200 bg-[#25262b] px-2.5 py-1.5 rounded-lg border border-[#2c2e33] focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="text-gray-400 flex items-center justify-between mb-1">
          <span>Source / Origin</span>
          {renderLockToggle('source_origin')}
        </label>
        <input
          type="text"
          placeholder="e.g. Naruto, Anime, Reaction GIF"
          value={sourceOrigin}
          onChange={(e) => handleFieldChange('source_origin', e.target.value, setSourceOrigin, item.metadata?.sourceOrigin)}
          className="w-full font-medium text-gray-200 bg-[#25262b] px-2.5 py-1.5 rounded-lg border border-[#2c2e33] focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-gray-400 flex items-center justify-between mb-1">
            <span>Action</span>
            {renderLockToggle('action')}
          </label>
          <input
            type="text"
            placeholder="e.g. Running, Laughing"
            value={action}
            onChange={(e) => handleFieldChange('action', e.target.value, setAction, item.metadata?.action)}
            className="w-full font-medium text-gray-200 bg-[#25262b] px-2.5 py-1.5 rounded-lg border border-[#2c2e33] focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-gray-400 flex items-center justify-between mb-1">
            <span>Feeling</span>
            {renderLockToggle('feeling')}
          </label>
          <input
            type="text"
            placeholder="e.g. Happy, Smug"
            value={feeling}
            onChange={(e) => handleFieldChange('feeling', e.target.value, setFeeling, item.metadata?.feeling)}
            className="w-full font-medium text-gray-200 bg-[#25262b] px-2.5 py-1.5 rounded-lg border border-[#2c2e33] focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="text-gray-400 flex items-center justify-between mb-1">
          <span>Description</span>
          {renderLockToggle('description')}
        </label>
        <textarea
          rows={2}
          placeholder="Visual details or description..."
          value={description}
          onChange={(e) => handleFieldChange('description', e.target.value, setDescription, item.metadata?.description)}
          className="w-full font-medium text-gray-200 bg-[#25262b] px-2.5 py-1.5 rounded-lg border border-[#2c2e33] focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>

      <button
        onClick={handleSave}
        className="w-full py-1.5 px-3 rounded-lg bg-[#25262b] hover:bg-[#2c2e33] border border-[#3b3d45] text-gray-200 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors"
      >
        {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
        <span>{saved ? 'Saved' : 'Save Metadata'}</span>
      </button>

      <div>
        <label className="text-gray-400 block mb-1.5">Tags &amp; Keywords</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {item.tags.map((tag) => {
            const isUserTag = item.userTags?.includes(tag);
            return (
              <span
                key={tag}
                className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] ${
                  isUserTag
                    ? 'bg-blue-600/15 border border-blue-500/30 text-blue-200'
                    : 'bg-[#25262b] border border-[#2c2e33] text-gray-300'
                }`}
              >
                {isUserTag ? <Lock className="w-2.5 h-2.5 text-blue-400" /> : <Sparkles className="w-2.5 h-2.5 text-amber-400/70" />}
                <span>#{tag}</span>
                <button onClick={() => handleRemoveTag(tag)} className="text-gray-500 hover:text-red-400 ml-0.5">
                  ×
                </button>
              </span>
            );
          })}
        </div>

        <form onSubmit={handleAddTag} className="flex space-x-1.5">
          <input
            type="text"
            placeholder="Add user tag (protected)..."
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            className="flex-1 px-2.5 py-1 bg-[#25262b] border border-[#2c2e33] rounded-md text-xs placeholder-gray-500 text-gray-200 focus:outline-none focus:border-blue-500"
          />
          <button type="submit" className="p-1 rounded-md bg-[#25262b] border border-[#2c2e33] text-gray-400 hover:text-white">
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>

      <CustomAttributesEditor
        attributes={item.customAttributes || {}}
        onChange={handleCustomAttributesChange}
      />
    </div>
  );
};
