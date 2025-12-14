// src/lib/lists/useBookLists.ts
'use client';

import { useState } from 'react';
import type { BookList, ListBook } from './types';
import {
  loadLists,
  createList as storageCreateList,
  addBookToList as storageAddBook,
  removeBookFromList as storageRemoveBook,
  updateListMeta as storageUpdateMeta,
} from './storage';

export function useBookLists() {
  // Initialize from localStorage once
  const [lists, setLists] = useState<BookList[]>(() => loadLists());

  function refresh() {
    setLists(loadLists());
  }

  function createList(data: { name: string; description?: string; emoji?: string }) {
    const newList = storageCreateList(data);
    refresh();
    return newList;
  }

  function addBookToList(listId: string, book: ListBook) {
    storageAddBook(listId, book);
    refresh();
  }

  function removeBookFromList(listId: string, bookId: string) {
    storageRemoveBook(listId, bookId);
    refresh();
  }

  function updateListMeta(
    listId: string,
    updates: Partial<Pick<BookList, 'name' | 'description' | 'emoji' | 'visibility'>>
  ) {
    storageUpdateMeta(listId, updates);
    refresh();
  }

  return {
    lists,
    createList,
    addBookToList,
    removeBookFromList,
    updateListMeta,
  };
}
