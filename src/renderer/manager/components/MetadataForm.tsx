import React, { useState, useEffect } from 'react';
import { Plus, Check } from 'lucide-react';
import { StickerItem } from '../../../types/models';

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
  const [newTagInput, setNewTagInput] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setCharacter(item.metadata?.character || '');
    setSourceOrigin(item.metadata?.sourceOrigin || '');
    setAction(item.metadata?.action || '');
    setFeeling(item.metadata?.feeling || '');
    setDescription(item.metadata?.description || '');
    setSaved(false);
  }, [item.id, item.metadata]);

  const handleSave = () => {
    onUpdateMetadata(item.id, {
      character: character.trim() || undefined,
      sourceOrigin: sourceOrigin.trim() || undefined,
      action: action.trim() || undefined,
      feeling: feeling.trim() || undefined,
      description: description.trim() || undefined,
      tags: item.tags,
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
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-gray-400 block mb-1">Character / Entity</label>
        <input
          type="text"
          placeholder="e.g. Sasuke, Pikachu, Pepe"
          value={character}
          onChange={(e) => setCharacter(e.target.value)}
          className="w-full font-medium text-gray-200 bg-[#25262b] px-2.5 py-1.5 rounded-lg border border-[#2c2e33] focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="text-gray-400 block mb-1">Source / Origin</label>
        <input
          type="text"
          placeholder="e.g. Naruto, Anime, Reaction GIF"
          value={sourceOrigin}
          onChange={(e) => setSourceOrigin(e.target.value)}
          className="w-full font-medium text-gray-200 bg-[#25262b] px-2.5 py-1.5 rounded-lg border border-[#2c2e33] focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-gray-400 block mb-1">Action</label>
          <input
            type="text"
            placeholder="e.g. Running, Laughing"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full font-medium text-gray-200 bg-[#25262b] px-2.5 py-1.5 rounded-lg border border-[#2c2e33] focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-gray-400 block mb-1">Feeling</label>
          <input
            type="text"
            placeholder="e.g. Happy, Smug"
            value={feeling}
            onChange={(e) => setFeeling(e.target.value)}
            className="w-full font-medium text-gray-200 bg-[#25262b] px-2.5 py-1.5 rounded-lg border border-[#2c2e33] focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="text-gray-400 block mb-1">Description</label>
        <textarea
          rows={2}
          placeholder="Visual details or description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full font-medium text-gray-200 bg-[#25262b] px-2.5 py-1.5 rounded-lg border border-[#2c2e33] focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>

      <button
        onClick={handleSave}
        className="w-full py-1.5 px-3 rounded-lg bg-[#25262b] hover:bg-[#2c2e33] border border-[#3b3d45] text-gray-200 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors"
      >
        {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
        <span>{saved ? 'Metadata Saved!' : 'Save Metadata'}</span>
      </button>

      <div>
        <label className="text-gray-400 block mb-1.5">Tags &amp; Keywords</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center space-x-1 bg-[#25262b] border border-[#2c2e33] px-2 py-0.5 rounded-md text-[11px] text-gray-300"
            >
              <span>#{tag}</span>
              <button onClick={() => handleRemoveTag(tag)} className="text-gray-500 hover:text-red-400 ml-0.5">
                ×
              </button>
            </span>
          ))}
        </div>

        <form onSubmit={handleAddTag} className="flex space-x-1.5">
          <input
            type="text"
            placeholder="Add custom tag..."
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            className="flex-1 px-2.5 py-1 bg-[#25262b] border border-[#2c2e33] rounded-md text-xs placeholder-gray-500 text-gray-200 focus:outline-none focus:border-blue-500"
          />
          <button type="submit" className="p-1 rounded-md bg-[#25262b] border border-[#2c2e33] text-gray-400 hover:text-white">
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
