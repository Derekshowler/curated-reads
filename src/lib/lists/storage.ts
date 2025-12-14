// src/lib/lists/storage.ts
import type { BookList, ListBook } from './types';

const STORAGE_KEY = 'cr_book_lists';

function isClient() {
  return typeof window !== 'undefined';
}

function loadListsRaw(): BookList[] {
  if (!isClient()) return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as BookList[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveLists(lists: BookList[]) {
  if (!isClient()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

export function loadLists(): BookList[] {
  return loadListsRaw();
}

export function getListById(id: string): BookList | undefined {
  return loadListsRaw().find((l) => l.id === id);
}

export function createList(input: {
  name: string;
  description?: string;
  emoji?: string;
}): BookList {
  const now = new Date().toISOString();
  const id = isClient() && 'crypto' in window ? crypto.randomUUID() : `${Date.now()}`;

  const slug = input.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const newList: BookList = {
    id,
    slug,
    name: input.name,
    description: input.description,
    emoji: input.emoji,
    visibility: 'private',
    bookIds: [],
    books: [],
    createdAt: now,
    updatedAt: now,
  };

  const lists = loadListsRaw();
  const updated = [newList, ...lists];
  saveLists(updated);

  return newList;
}

export function addBookToList(listId: string, book: ListBook) {
  const lists = loadListsRaw();
  const idx = lists.findIndex((l) => l.id === listId);
  if (idx === -1) return;

  const list = lists[idx];

  if (!list.bookIds.includes(book.id)) {
    list.bookIds.push(book.id);
    list.books.push(book);
    list.updatedAt = new Date().toISOString();
    saveLists(lists);
  }
}

export function removeBookFromList(listId: string, bookId: string) {
  const lists = loadListsRaw();
  const idx = lists.findIndex((l) => l.id === listId);
  if (idx === -1) return;

  const list = lists[idx];
  list.bookIds = list.bookIds.filter((id) => id !== bookId);
  list.books = list.books.filter((b) => b.id !== bookId);
  list.updatedAt = new Date().toISOString();
  saveLists(lists);
}

export function updateListMeta(
  id: string,
  updates: Partial<Pick<BookList, 'name' | 'description' | 'emoji' | 'visibility'>>
) {
  const lists = loadListsRaw();
  const idx = lists.findIndex((l) => l.id === id);
  if (idx === -1) return;

  lists[idx] = {
    ...lists[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveLists(lists);
}
