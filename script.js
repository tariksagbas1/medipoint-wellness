const itemModal = document.getElementById('addItemModal');
const categoryModal = document.getElementById('addCategoryModal');
const addItemBtn = document.getElementById('addItemBtn');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const closeItemModal = document.getElementById('closeModal');
const closeCategoryModal = document.getElementById('closeCategoryModal');
const addItemForm = document.getElementById('addItemForm');
const addCategoryForm = document.getElementById('addCategoryForm');

let menuData = [];
fetch('https://mpw-menu-configuration-60187015874.europe-west8.run.app/add_menu_item', { method: 'GET' })
  .then(res => {
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  })
  .then(data => {
    menuData = data;
    console.log(menuData);
    renderMenu();
    // now your existing render logic that reads menuData will work
  })
  .catch(err => {
    console.error('Failed to load menuData:', err);
  });


function renderMenu() {
  const menuCategories = document.querySelector('.menu-categories');
  const navbar = document.querySelector('.navbar');

  // Add navigation links
  navbar.innerHTML = menuData.map(category =>
    `<a href="#${category.name.replace(/\s+/g, '-')}">${category.name}</a>`
  ).join('');

  // Render menu categories and items
  menuCategories.innerHTML = menuData.map(category => `
    <section class="category" id="${category.name.replace(/\s+/g, '-')}">
      <h2>${category.name}</h2>
      ${category.name === 'Çorbalar' ? '<div class="category-subtitle">(Çorba çeşitleri günlük olarak değişmektedir.)</div>' : ''}
      <div class="menu-items">
        ${category.items.map(item => `
          <div class="menu-item" onclick="showItemModal('${item.photo_url}', '${item.name}', '${item.description}', '${item.price}')">
            <img src="${item.photo_url}" alt="${item.name}">
            <div class="item-details">
              <h3>${item.name}</h3>
              <p>${item.description}</p>
              <span class="price">₺${item.price}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `).join('');

  // Add item modal to the page
  const itemViewModal = document.createElement('div');
  itemViewModal.id = 'itemViewModal';
  itemViewModal.className = 'item-view-modal';
  itemViewModal.innerHTML = `
    <div class="item-view-content">
      <span class="close-item-view">&times;</span>
      <img id="modalImage" src="" alt="">
      <h2 id="modalTitle"></h2>
      <p id="modalDescription"></p>
      <span id="modalPrice" class="price"></span>
    </div>
  `;
  document.body.appendChild(itemViewModal);

  // Close modal when clicking the close button or outside the modal
  const closeItemView = document.querySelector('.close-item-view');
  if (closeItemView) {
    closeItemView.onclick = () => {
      itemViewModal.style.display = 'none';
    };
  }

  window.onclick = (e) => {
    if (e.target === itemViewModal) {
      itemViewModal.style.display = 'none';
    }
    if (e.target === itemModal) {
      itemModal.style.display = 'none';
    }
    if (e.target === categoryModal) {
      categoryModal.style.display = 'none';
    }
  };

  // Add event listeners for Add buttons if they exist
  if (addItemBtn) {
    addItemBtn.addEventListener('click', () => {
      itemModal.style.display = 'flex';
    });
  }

  if (closeItemModal) {
    closeItemModal.addEventListener('click', () => {
      itemModal.style.display = 'none';
    });
  }

  if (addCategoryBtn) {
    addCategoryBtn.addEventListener('click', () => {
      categoryModal.style.display = 'flex';
    });
  }

  if (closeCategoryModal) {
    closeCategoryModal.addEventListener('click', () => {
      categoryModal.style.display = 'none';
    });
  }

  if (addItemForm) {
    addItemForm.addEventListener('submit', (e) => {
      e.preventDefault();
      itemModal.style.display = 'none';
      addItemForm.reset();
    });
  }

  if (addCategoryForm) {
    addCategoryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      categoryModal.style.display = 'none';
      addCategoryForm.reset();
    });
  }
}

function toggleDescription(element) {
  const expanded = element.classList.contains('expanded');
  const allItems = document.querySelectorAll('.menu-item');
  allItems.forEach(item => item.classList.remove('expanded'));
  if (!expanded) {
    element.classList.add('expanded');
  }
}

function showItemModal(photoUrl, name, description, price) {
  const modal = document.getElementById('itemViewModal');
  const modalImg = document.getElementById('modalImage');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDescription');
  const modalPrice = document.getElementById('modalPrice');

  if (modal && modalImg && modalTitle && modalDesc && modalPrice) {
    modalImg.src = photoUrl;
    modalTitle.textContent = name;
    modalDesc.textContent = description;
    modalPrice.textContent = `₺${price}`;
    modal.style.display = 'flex';
  }
}

function showMenu() {
  let menu = document.getElementsByClassName("container")[0];
  let buttons = document.getElementsByClassName("buttons-div")[0];
  let subheading = document.getElementsByClassName("subheading")[0];
  subheading.style.display = 'block';
  buttons.style.display = 'none';
  menu.style.display = 'block';
}