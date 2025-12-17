document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".tab-btn");
  const contentDiv = document.querySelector(".content");

  async function loadTab(fileName) {
    try {
      const response = await fetch(`static/css/tabs/${fileName}.md`);
      const text = await response.text();
      contentDiv.innerHTML = marked.parse(text);
      contentDiv.id = `tab-${fileName}`;
    } catch (err) {
      contentDiv.innerHTML = '<p style="color:red;">Ошибка загрузки файла</p>';
      console.error(err);
    }
  }

  function activateTab(fileName) {
    buttons.forEach((b) => b.classList.remove("active"));
    const targetBtn = Array.from(buttons).find(
      (b) => b.dataset.file === fileName
    );
    if (targetBtn) {
      targetBtn.classList.add("active");
      loadTab(fileName);
    }
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const file = btn.getAttribute("data-file");
      activateTab(file);
      history.replaceState(null, null, window.location.pathname);
    });
  });

  if (window.location.hash) {
    const hash = window.location.hash.substring(1);
    if (hash.startsWith("tab-")) {
      const fileName = hash.substring(4);
      activateTab(fileName);
      setTimeout(() => {
        contentDiv.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  } else {
    buttons[0]?.click();
  }
});
