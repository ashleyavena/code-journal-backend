import { User } from './components/UserContext';

export type Entry = {
  entryId?: number;
  userId?: number;
  title: string;
  notes: string;
  photoUrl: string;
};

const authKey = 'um.auth';

type Auth = {
  user: User;
  token: string;
};

export function saveAuth(user: User, token: string): void {
  const auth: Auth = { user, token };
  localStorage.setItem(authKey, JSON.stringify(auth));
  console.log(user, token, "what's up");
}

export function removeAuth(): void {
  localStorage.removeItem(authKey);
}

export function readUser(): User | undefined {
  const auth = localStorage.getItem(authKey);
  if (!auth) return undefined;
  return (JSON.parse(auth) as Auth).user;
}

export function readToken(): string | undefined {
  const auth = localStorage.getItem(authKey);
  if (!auth) return undefined;
  return (JSON.parse(auth) as Auth).token;
}

export async function readEntries(): Promise<Entry[]> {
  const req = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${readToken()}`,
    },
  };
  const res = await fetch('/api/entries', req);
  if (!res.ok) {
    console.error('Fetch error details:', {
      status: res.status,
      statusText: res.statusText,
    });
    throw new Error(`Failed to fetch entries. Status: ${res.status}`);
  }

  const entries = await res.json();
  console.log('Fetched Entries:', entries); // Check the data
  return entries as Entry[];
}

export async function readEntry(entryId: number): Promise<Entry | undefined> {
  const response = await fetch(`/api/entries/${entryId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${readToken()}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch entry. Status: ${response.status}`);
  }
  const data = (await response.json()) as Entry;
  return data;
}

export async function addEntry(newEntry: Entry) {
  const response = await fetch('/api/entries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${readToken()}`,
    },
    body: JSON.stringify(newEntry),
  });
  if (!response.ok) throw new Error(`response status ${response.status}`);
  const data = (await response.json()) as Entry;
  return data;
}

export async function updateEntry(entry: Entry) {
  const response = await fetch(`/api/entries/${entry.entryId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${readToken()}`,
    },
    body: JSON.stringify(entry),
  });
  if (!response.ok)
    throw new Error(`Failed to update entry ${response.status}`);
  const data = (await response.json()) as Entry;
  return data;
}

export async function removeEntry(entryId: number) {
  const response = await fetch(`/api/entries/${entryId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${readToken()}`,
    },
  });
  if (!response.ok)
    throw new Error(`Failed to delete entry ${response.status}`);
  return (await response.json()) as Entry;
}

//   const newEntries = data.entries.map((e) => // map is unnecessary  if you're relying on API
// return readData().entries.find((e) => e.entryId === entryId); utilize this find method if its only using localstorage?
// const dataKey = 'code-journal-data';

// function readData(): Data {
//   let data: Data;
//   const localData = localStorage.getItem(dataKey);
//   if (localData) {
//     data = JSON.parse(localData) as Data;
//   } else {
//     data = {
//       entries: [],
//       nextEntryId: 1,
//     };
//   }
//   return data;
// }

// function writeData(data: Data): void {
//   const dataJSON = JSON.stringify(data);
//   localStorage.setItem(dataKey, dataJSON);
// }

// If you're aiming to maintain a local cache of your entries in localStorage
// in addition to fetching data from the API,
// we can reintroduce writeData appropriately.

// type Data = {
//   entries: Entry[];
//   nextEntryId: number;
// };
