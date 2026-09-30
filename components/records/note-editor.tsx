"use client";

import { useState } from "react";
import { Plus, X, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NoteEditorProps {
  notes: string[];
  onChange: (notes: string[]) => void;
}

/** Bullet-style accomplishments editor with add/remove/reorder. */
export function NoteEditor({ notes, onChange }: NoteEditorProps) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const value = draft.trim();
    if (!value) return;
    onChange([...notes, value]);
    setDraft("");
  };

  const remove = (i: number) => onChange(notes.filter((_, idx) => idx !== i));

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= notes.length) return;
    const next = [...notes];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const edit = (i: number, value: string) => {
    const next = [...notes];
    next[i] = value;
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <ul className="space-y-2">
        {notes.map((note, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="text-muted-foreground">•</span>
            <Input
              value={note}
              onChange={(e) => edit(i, e.target.value)}
              className="flex-1"
              aria-label={`Accomplishment ${i + 1}`}
            />
            <div className="flex shrink-0 gap-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => move(i, -1)}
                aria-label="Move up"
                disabled={i === 0}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => move(i, 1)}
                aria-label="Move down"
                disabled={i === notes.length - 1}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive"
                onClick={() => remove(i)}
                aria-label="Remove"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Add an accomplishment and press Enter"
          aria-label="New accomplishment"
        />
        <Button type="button" variant="subtle" onClick={add}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
    </div>
  );
}
