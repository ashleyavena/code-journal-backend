// import { EntryForm } from './pages/EntryForm';

export type Entry = {
  entryId?: number;
  title: string;
  notes: string;
  photoUrl: string;
};

type Data = {
  entries: Entry[];
  nextEntryId: number;
};

const dataKey = 'code-journal-data';

function readData(): Data {
  let data: Data;
  const localData = localStorage.getItem(dataKey);
  if (localData) {
    data = JSON.parse(localData) as Data;
  } else {
    data = {
      entries: [],
      nextEntryId: 1,
    };
  }
  return data;
}

// function writeData(data: Data): void {
//   const dataJSON = JSON.stringify(data);
//   localStorage.setItem(dataKey, dataJSON);
// }

// If you're aiming to maintain a local cache of your entries in localStorage
// in addition to fetching data from the API,
// we can reintroduce writeData appropriately.

export async function readEntries(): Promise<Entry[]> {
  const response = await fetch('/api/entries');
  if (!response.ok) {
    throw new Error(`Failed to fetch entries. Status: ${response.status}`);
  }
  return readData().entries;
  // return (await response.json()) as Entry[];
}

export async function readEntry(entryId: number): Promise<Entry | undefined> {
  const response = await fetch(`/api/entries/${entryId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch entry. Status: ${response.status}`);
  }
  const data = (await response.json()) as Entry;
  return data;

  // return readData().entries.find((e) => e.entryId === entryId); utilize this find method if its only using localstorage?
}

export async function addEntry(newEntry: Entry) {
  try {
    const response = await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // the body contains an object that has been stringified
      body: JSON.stringify(newEntry), // SERIALIZE the todo object in the body with JSON.stringify() to send to back end
    });
    if (!response.ok) throw new Error(`response status ${response.status}`);
    const data = (await response.json()) as Entry;
    // setTodos((prevEntry) => [...prevEntry, data]); // create a new array with the old todos, plus the new todos returned by the server
    // // with Array.prototype.concat or use the spread operator: `[...oldArray, addedItem]`
    return data;
  } catch (error) {
    alert('there is an error' + String(error)); // bc if we setError then it replaces the whole page with the error, instead alert is better
  }
}

// const data = readData();
// const newEntry = {
//   ...entry,
//   entryId: data.nextEntryId++,
// };
// data.entries.unshift(newEntry);
// writeData(data);
// return newEntry;

export async function updateEntry(entry: Entry) {
  try {
    const response = await fetch(`/api/entries/${entry.entryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    if (!response.ok)
      throw new Error(`Failed to update entry ${response.status}`);
    const data = (await response.json()) as Entry;
    return data;
  } catch (error) {
    alert('there was an error updating entry' + error);
  }
}

//   const newEntries = data.entries.map((e) => // map is unnecessary  if you're relying on API

export async function removeEntry(entryId: number) {
  try {
    const response = await fetch(`/api/entries/${entryId}`, {
      method: 'DELETE',
    });
    if (!response.ok)
      throw new Error(`Failed to delete entry ${response.status}`);
    const data = (await response.json()) as Entry;
    return data;
  } catch (error) {
    alert('there was an error deleting entry' + error);
  }
}

//   const data = readData();
//   const updatedArray = data.entries.filter(
//     (entry) => entry.entryId !== entryId
//   );
//   data.entries = updatedArray;
//   writeData(data);
// }
