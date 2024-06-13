async function fetchLevels() {
  try {
    const response = await fetch('/levels');
    if (!response.ok) {
      throw new Error('Failed to fetch levels');
    }
    const levels = await response.json();
    displayLevels(levels);
    fadeInDashboard();
  } catch (error) {
    console.error('Error fetching levels:', error);
  }
}

async function deleteLevel(index) {
  try {
    const response = await fetch(`/levels/${index}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error('Failed to delete level');
    }
    
    const card = document.getElementById(`card-${index}`);
    card.style.animation = 'fadeOut 0.5s ease';
    setTimeout(() => {
      fetchLevels();
    }, 500);
  } catch (error) {
    console.error('Error deleting level:', error);
  }
}

async function saveLevel(index) {
  const card = document.getElementById(`card-${index}`);
  const difficultyInput = card.querySelector('.difficulty-input');
  const answerInput = card.querySelector('.answer-input');

  try {
    const response = await fetch(`/levels/${index}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Difficulty: difficultyInput.value,
        Answer: answerInput.value
      })
    });
    if (!response.ok) {
      throw new Error('Failed to update level');
    }
    card.style.animation = 'fadeOut 0.5s ease';
    setTimeout(() => {
      fetchLevels(); 
    }, 500);
  } catch (error) {
    console.error('Error saving level:', error);
  }
}

function displayLevels(levels) {
  const container = document.getElementById('levels-container');
  container.innerHTML = ''; 

  levels.forEach((level, index) => {
    const card = document.createElement('div');
    card.id = `card-${index}`;
    card.classList.add('level-card', 'col-md-4');
    card.style.animation = 'fadeIn 0.5s ease'; 
    card.innerHTML = `
      <div class="card">
        <img src="${level.Thumbnail}" class="card-img-top" alt="Thumbnail">
        <div class="card-body">
          <h5 class="card-title">Difficulty: ${level.Difficulty}</h5>
          <p class="card-text">Answer: ${level.Answer}</p>
          <button class="btn btn-primary edit-btn" onclick="toggleEditMode(${index})">Edit</button>
          <button class="btn btn-danger ml-2" onclick="deleteLevel(${index})">Delete</button>
          <div class="edit-mode mt-3" style="display: none;">
            <input type="text" class="form-control difficulty-input mb-2" value="${level.Difficulty}">
            <input type="text" class="form-control answer-input mb-2" value="${level.Answer}">
            <button class="btn btn-success save-btn" onclick="saveLevel(${index})">Save</button>
            <button class="btn btn-secondary ml-2 cancel-btn" onclick="toggleEditMode(${index})">Cancel</button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function toggleEditMode(index) {
  const card = document.getElementById(`card-${index}`);
  const editMode = card.querySelector('.edit-mode');
  const normalModeElements = card.querySelectorAll('.card-title, .card-text, .edit-btn, .btn-danger');

  editMode.style.display = editMode.style.display === 'none' ? 'block' : 'none';
  normalModeElements.forEach(element => {
    element.style.display = element.style.display === 'none' ? 'block' : 'none';
  });
}

async function logout() {
  try {
    const response = await fetch('/logout', {
      method: 'GET'
    });
    if (!response.ok) {
      throw new Error('Logout failed');
    }
    window.location.replace('/login'); 
  } catch (error) {
    console.error('Error logging out:', error);
  }
}

function fadeInDashboard() {
  const container = document.querySelector('.container');
  container.style.animation = 'fadeIn 1s ease';
}


$('#welcomeModal').modal('show');


fetchLevels();
