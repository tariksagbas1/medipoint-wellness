const form = document.getElementById('menuForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  try {
    const res = await fetch('https://mpw-menu-configuration-60187015874.europe-west8.run.app/add_menu_item', {
      method: 'POST',
      body:   fd
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }
    alert('Ürün Eklendi!');
    form.reset();

  } 
  catch (err) {
    console.error(err);
    alert('Error: ' + err.message);
  }
});

