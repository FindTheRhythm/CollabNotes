import React, { useState } from "react";

interface NoteToolbarProps {
  onSearch: (query: string) => void;
  onCreateNew: () => void;
  isLoading: boolean;
}

export function NoteToolbar({ onSearch, onCreateNew, isLoading }: NoteToolbarProps): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="note-toolbar">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !searchQuery.trim()}>
          Search
        </button>
      </form>

      <button onClick={onCreateNew} disabled={isLoading} className="create-btn">
        New Note
      </button>
    </div>
  );
}
