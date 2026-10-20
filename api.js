const API_URL = 'https://jsonplaceholder.typicode.com/posts';

async function request(path = '', options = {}) {
  const res = await fetch(API_URL + path, options);
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return res.json();
}

// ===== DOM References =====
const loadBtn   = document.getElementById('load-btn');
const statusEl  = document.getElementById('status');
const notesList = document.getElementById('notes-list');

// ===== Render Note =====
function renderNote(note) {
  const li    = document.createElement('li');
  const title = document.createElement('strong');
  const body  = document.createTextNode(' ' + note.body);

  title.textContent = note.title;

  const delBtn = document.createElement('button');
  delBtn.textContent = 'Delete';
  delBtn.className = 'delete-btn';

  const id = note.id;

  delBtn.addEventListener('click', async () => {
    delBtn.disabled = true;

    try {
      // JSONPlaceholder is a mock API: POSTed notes are never persisted, so
      // DELETE /posts/{id} returns 200 even for notes it never stored. We only
      // call DELETE for notes the server returned, and we remove the item from
      // the DOM only after a successful response — this mirrors how a real
      // backend would behave.
      await request('/' + id, { method: 'DELETE' });
      li.remove();
      statusEl.textContent = 'Note deleted.';
      statusEl.className   = 'success';
    } catch (err) {
      statusEl.textContent = 'Failed to delete note. Please try again.';
      statusEl.className   = 'error';
      delBtn.disabled      = false;
    } finally {
      if (document.body.contains(delBtn)) {
        delBtn.disabled = false;
      }
    }
  });

  li.appendChild(title);
  li.appendChild(body);
  li.appendChild(delBtn);

  return li;
}

// ===== Load Notes (GET) =====
async function loadNotes() {
  statusEl.textContent = 'Loading notes...';
  statusEl.className   = 'loading';
  loadBtn.disabled     = true;
  notesList.innerHTML  = '';

  try {
    const notes = await request('?_limit=10');

    if (!notes.length) {
      const li = document.createElement('li');
      li.textContent = 'No notes yet.';
      notesList.appendChild(li);
      statusEl.textContent = 'No notes found.';
      statusEl.className   = 'success';
      return;
    }

    notes.forEach((note) => {
      const li = renderNote(note);
      notesList.appendChild(li);
    });

    statusEl.textContent = 'Loaded 10 notes from the server.';
    statusEl.className   = 'success';
  } catch (err) {
    statusEl.textContent = 'Failed to load notes. Please check your connection and try again.';
    statusEl.className   = 'error';
  } finally {
    loadBtn.disabled = false;
  }
}

loadBtn.addEventListener('click', loadNotes);

// ===== DOM References (Form) =====
const noteForm   = document.getElementById('note-form');
const titleInput = document.getElementById('title-input');
const bodyInput  = document.getElementById('body-input');
const submitBtn  = document.getElementById('submit-btn');

// ===== Create Note (POST) =====
async function createNote() {
  const title = titleInput.value.trim();

  // --- Validation ---
  if (!title) {
    statusEl.textContent = 'Title is required.';
    statusEl.className   = 'error';
    return;
  }

  if (title.length > 100) {
    statusEl.textContent = 'Title must be 100 characters or fewer.';
    statusEl.className   = 'error';
    return;
  }

  submitBtn.disabled = true;

  try {
    const note = await request('', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body: bodyInput.value.trim(), userId: 1 })
    });

    // --- Prepend new note to list ---
    const li = renderNote(note);
    notesList.prepend(li);

    // --- Success status ---
    statusEl.textContent = `Note created (status 201, id ${note.id}).`;
    statusEl.className   = 'success';

    // --- Clear form ---
    titleInput.value = '';
    bodyInput.value  = '';
  } catch (err) {
    statusEl.textContent = 'Failed to create note. Please try again.';
    statusEl.className   = 'error';
  } finally {
    submitBtn.disabled = false;
  }
}

noteForm.addEventListener('submit', (event) => {
  event.preventDefault();
  createNote();
});